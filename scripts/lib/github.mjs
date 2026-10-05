/**
 * GitHub metadata used by the profile card.
 *
 * Statistics are only ever rendered when the API actually returned them — a
 * failed request omits the chip instead of printing a zero, so the card never
 * states something that was not measured.
 */

const API = 'https://api.github.com';
const TIMEOUT_MS = 8000;

function headers(token) {
  return {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'blueokanna-profile-renderer',
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

async function request(url, token, binary = false) {
  const response = await fetch(url, { headers: headers(token), signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  if (!binary) return response.json();
  return {
    mime: (response.headers.get('content-type') || 'image/png').split(';')[0].trim(),
    buffer: Buffer.from(await response.arrayBuffer()),
  };
}

/**
 * Fetches the account metadata shown on the card.
 * Returns null when the API is unreachable so rendering can continue.
 */
export async function fetchAccount(login, token) {
  try {
    const data = await request(`${API}/users/${encodeURIComponent(login)}`, token);
    return {
      avatarUrl: data.avatar_url,
      name: data.name || null,
      publicRepos: Number.isFinite(data.public_repos) ? data.public_repos : null,
      followers: Number.isFinite(data.followers) ? data.followers : null,
      following: Number.isFinite(data.following) ? data.following : null,
      createdAt: data.created_at || null,
    };
  } catch (error) {
    console.warn(`render: account lookup failed (${error.message}); rendering without live stats`);
    return null;
  }
}

/**
 * Downloads the account avatar. The GitHub avatar is the only portrait used on
 * the card — no substitute image is generated when the download fails.
 */
export async function fetchAvatar(account, token) {
  if (!account?.avatarUrl) return null;
  try {
    const size = new URL(account.avatarUrl);
    size.searchParams.set('s', '460');
    return { ...(await request(size.toString(), token, true)), source: account.avatarUrl };
  } catch (error) {
    console.warn(`render: avatar download failed (${error.message}); rendering without the portrait`);
    return null;
  }
}
