const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'jasonyuan886';
export const ORDERS_REPO = 'freshlock-orders';

async function ghApi(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'freshlock-admin',
      ...(init?.headers || {}),
    },
  });
}

async function readJsonFromRepo(repo: string, path: string): Promise<{ data: any; sha: string | null } | null> {
  const res = await ghApi(`https://api.github.com/repos/${OWNER}/${repo}/contents/${encodeURIComponent(path)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`read ${repo}/${path}: HTTP ${res.status}`);
  const file = await res.json();
  return { data: JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')), sha: file.sha || null };
}

export async function readOrdersJson(path: string) {
  return readJsonFromRepo(ORDERS_REPO, path);
}

export async function writeOrdersJson(path: string, data: any, message: string): Promise<void> {
  const existing = await readJsonFromRepo(ORDERS_REPO, path);
  const body: any = {
    message,
    content: Buffer.from(JSON.stringify(data, null, 2), 'utf8').toString('base64'),
    branch: 'main',
  };
  if (existing?.sha) body.sha = existing.sha;
  const res = await ghApi(`https://api.github.com/repos/${OWNER}/${ORDERS_REPO}/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`write ${path}: HTTP ${res.status}`);
}

export async function listOrdersDir(): Promise<Array<{ name: string }>> {
  const res = await ghApi(`https://api.github.com/repos/${OWNER}/${ORDERS_REPO}/contents/orders`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data.map((x: any) => ({ name: x.name })) : [];
}
