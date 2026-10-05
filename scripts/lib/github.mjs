/**
 * GitHub metadata used by the profile cards.
 *
 * Every number that reaches a template was returned by the API during the run.
 * A metric that could not be fetched stays null and its row is simply not
 * drawn — the card never states a value that was not measured, and it never
 * prints a zero as a substitute for "unknown".
 */

const API = 'https://api.github.com';
const TIMEOUT_MS = 12000;

/** Repositories inspected when aggregating language bytes. */
const LANGUAGE_REPO_SAMPLE = 40;

function headers(token, extra = {}) {
  return {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'blueokanna-profile-renderer',
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(url, token, { binary = false, extra = {} } = {}) {
  const response = await fetch(url, { headers: headers(token, extra), signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  if (!binary) return response.json();
  return {
    mime: (response.headers.get('content-type') || 'image/png').split(';')[0].trim(),
    buffer: Buffer.from(await response.arrayBuffer()),
  };
}

/** Runs `job`, returning null (and logging once) when it fails. */
async function optional(label, job) {
  try {
    return await job();
  } catch (error) {
    console.warn(`metrics: ${label} unavailable (${error.message})`);
    return null;
  }
}

/** Colour used for a language bar segment. Linguist colours where known. */
const LANGUAGE_COLORS = {
  Rust: '#dea584',
  Dart: '#00b4ab',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Kotlin: '#a97bff',
  'C++': '#f34b7d',
  C: '#8a8a8a',
  'C#': '#178600',
  Java: '#b07219',
  Python: '#3572a5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  CMake: '#da3434',
  Pawn: '#dbb284',
  Shell: '#89e051',
  Go: '#00add8',
  GLSL: '#5686a5',
  QML: '#44a51c',
  Lua: '#5b5bd6',
  Ruby: '#701516',
  Swift: '#f05138',
  PHP: '#4f5d95',
  Vue: '#41b883',
};

const FALLBACK_COLORS = ['#66c0f4', '#4d8fd6', '#a9c8ee', '#cfe4ff', '#8fd4ff', '#5aa9e6', '#7fb8e8', '#3f7fbf'];

/** The public account record plus the avatar used on the banner. */
export async function fetchAccount(login, token) {
  return optional('account lookup', async () => {
    const data = await request(`${API}/users/${encodeURIComponent(login)}`, token);
    return {
      avatarUrl: data.avatar_url,
      name: data.name || null,
      publicRepos: Number.isFinite(data.public_repos) ? data.public_repos : null,
      followers: Number.isFinite(data.followers) ? data.followers : null,
      following: Number.isFinite(data.following) ? data.following : null,
      createdAt: data.created_at || null,
    };
  });
}

/** Downloads the account avatar. No substitute image is ever generated. */
export async function fetchAvatar(account, token) {
  if (!account?.avatarUrl) return null;
  return optional('avatar download', async () => {
    const url = new URL(account.avatarUrl);
    url.searchParams.set('s', '460');
    return { ...(await request(url.toString(), token, { binary: true })), source: account.avatarUrl };
  });
}

/**
 * Aggregates the statistics shown on the telemetry card.
 *
 *   stars, forks, repos   /users/:login and /users/:login/repos (owner only)
 *   commits, PRs, issues  GraphQL contributionsCollection, falling back to the
 *                         REST search index when the token cannot read it
 *   languages             /repos/:owner/:name/languages over the largest repos
 */
export async function collectMetrics(login, token, { reposSample = LANGUAGE_REPO_SAMPLE } = {}) {
  const metrics = {
    stars: null,
    forks: null,
    commits: null,
    pullRequests: null,
    issues: null,
    repositories: null,
    followers: null,
    since: null,
    languages: [],
    languageRepos: 0,
    sources: [],
  };

  const account = await fetchAccount(login, token);
  if (account) {
    metrics.repositories = account.publicRepos;
    metrics.followers = account.followers;
    metrics.since = account.createdAt ? new Date(account.createdAt).getUTCFullYear() : null;
  }

  const repos = await optional('repository list', async () => {
    const collected = [];
    for (let page = 1; page <= 2; page += 1) {
      const batch = await request(
        `${API}/users/${encodeURIComponent(login)}/repos?per_page=100&page=${page}&type=owner&sort=pushed`,
        token,
      );
      collected.push(...batch);
      if (batch.length < 100) break;
    }
    return collected;
  });

  if (repos) {
    metrics.stars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    metrics.forks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
  }

  const contributions = await optional('contributions collection', async () => {
    const query = `query($login: String!) { user(login: $login) { contributionsCollection { totalCommitContributions totalPullRequestContributions totalIssueContributions } } }`;
    const response = await fetch(`${API}/graphql`, {
      method: 'POST',
      headers: headers(token, { 'content-type': 'application/json' }),
      body: JSON.stringify({ query, variables: { login } }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const payload = await response.json();
    if (payload.errors) throw new Error(payload.errors.map((error) => error.message).join('; '));
    const collection = payload.data?.user?.contributionsCollection;
    if (!collection) throw new Error('no contributionsCollection in the response');
    return collection;
  });

  if (contributions) {
    metrics.commits = contributions.totalCommitContributions ?? null;
    metrics.pullRequests = contributions.totalPullRequestContributions ?? null;
    metrics.issues = contributions.totalIssueContributions ?? null;
    metrics.sources.push('graphql contributions');
  } else {
    const searchIssues = (kind, label) => optional(label, async () => {
      const data = await request(
        `${API}/search/issues?q=${encodeURIComponent(`author:${login} type:${kind}`)}&per_page=1`,
        token,
      );
      return Number.isFinite(data.total_count) ? data.total_count : null;
    });

    metrics.pullRequests = await searchIssues('pr', 'pull request search');
    metrics.issues = await searchIssues('issue', 'issue search');
    metrics.commits = await optional('commit search', async () => {
      const data = await request(`${API}/search/commits?q=${encodeURIComponent(`author:${login}`)}&per_page=1`, token);
      return Number.isFinite(data.total_count) ? data.total_count : null;
    });
    if (metrics.pullRequests !== null || metrics.commits !== null) metrics.sources.push('rest search index');
  }

  if (repos?.length) {
    const sample = [...repos]
      .filter((repo) => !repo.fork && !repo.archived && repo.size > 0)
      .sort((a, b) => (b.size || 0) - (a.size || 0))
      .slice(0, reposSample);

    const totals = new Map();
    let failures = 0;
    for (const repo of sample) {
      try {
        const bytes = await request(repo.languages_url, token);
        for (const [language, count] of Object.entries(bytes)) {
          totals.set(language, (totals.get(language) || 0) + count);
        }
      } catch {
        // A single repository must not abort the aggregate; the footer reports
        // how many repositories actually contributed to the totals.
        failures += 1;
      }
    }
    if (failures) console.warn(`metrics: language lookup failed for ${failures}/${sample.length} repositories (rate limit?)`);

    const sum = [...totals.values()].reduce((total, value) => total + value, 0);
    if (sum > 0) {
      let index = 0;
      metrics.languages = [...totals.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, bytes]) => {
          const color = LANGUAGE_COLORS[name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
          index += 1;
          return { name, bytes, percent: (bytes / sum) * 100, color };
        });
      metrics.languageRepos = sample.length - failures;
      metrics.sources.push(`languages from ${metrics.languageRepos} repos`);
    }
  }

  return metrics;
}
