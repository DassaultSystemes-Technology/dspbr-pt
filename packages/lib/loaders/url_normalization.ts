export function normalizeExternalAssetUrl(input: string): string {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return input;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return input;
  }

  const githubRaw = normalizeGithubAssetUrl(parsed);
  if (githubRaw) {
    return githubRaw;
  }

  return input;
}

function normalizeGithubAssetUrl(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length < 5) {
    return null;
  }

  if (host === 'github.com') {
    const [owner, repo, mode, ...rest] = segments;
    if (!owner || !repo) {
      return null;
    }

    if (mode === 'raw' && rest[0] === 'refs' && rest[1] === 'heads' && rest[2]) {
      const branch = rest[2];
      const assetPath = rest.slice(3).join('/');
      return buildRawGithubUrl(owner, repo, branch, assetPath);
    }

    if (mode === 'blob' && rest[0] === 'refs' && rest[1] === 'heads' && rest[2]) {
      const branch = rest[2];
      const assetPath = rest.slice(3).join('/');
      return buildRawGithubUrl(owner, repo, branch, assetPath);
    }

    if ((mode === 'raw' || mode === 'blob') && rest[0]) {
      const branch = rest[0];
      const assetPath = rest.slice(1).join('/');
      return buildRawGithubUrl(owner, repo, branch, assetPath);
    }
  }

  return null;
}

function buildRawGithubUrl(owner: string, repo: string, branch: string, assetPath: string): string | null {
  if (!assetPath) {
    return null;
  }
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${assetPath}`;
}
