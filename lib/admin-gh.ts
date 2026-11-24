const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'jasonyuan886';
export const STORE_REPO = 'freshlock-store';
export const ORDERS_REPO = 'freshlock-orders';

async function ghApi(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    cache: 'no-store',
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'freshlock-admin',
      ...(init?.headers || {}),
    },
  });
}

async function readRaw(repo: string, path: string, ref = 'main') {
  const res = await ghApi(`https://api.github.com/repos/${OWNER}/${repo}/contents/${encodeURIComponent(path)}?ref=${ref}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`read ${repo}/${path}: HTTP ${res.status}`);
  const file = await res.json();
  return { text: Buffer.from(file.content, 'base64').toString('utf8'), sha: file.sha || null };
}

async function writeRaw(repo: string, path: string, content: string, message: string, ref = 'main') {
  const existing = await readRaw(repo, path, ref);
  const body: any = {
    message,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch: ref,
  };
  if (existing?.sha) body.sha = existing.sha;
  const res = await ghApi(`https://api.github.com/repos/${OWNER}/${repo}/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`write ${repo}/${path}: HTTP ${res.status} ${t.slice(0, 120)}`);
  }
}

export const readStoreText = (p: string) => readRaw(STORE_REPO, p, 'master');
export const writeStoreText = (p: string, c: string, m: string) => writeRaw(STORE_REPO, p, c, m, 'master');
export const readOrdersText = (p: string) => readRaw(ORDERS_REPO, p, 'main');
export const writeOrdersText = (p: string, c: string, m: string) => writeRaw(ORDERS_REPO, p, c, m, 'main');

export async function readStoreJson(path: string) {
  const r = await readStoreText(path);
  return r ? { data: JSON.parse(r.text), sha: r.sha } : null;
}
export async function writeStoreJson(path: string, data: any, message: string) {
  await writeStoreText(path, JSON.stringify(data, null, 2) + '\n', message);
}
export async function readOrdersJson(path: string) {
  const r = await readOrdersText(path);
  return r ? { data: JSON.parse(r.text), sha: r.sha } : null;
}

export async function listOrdersDir(): Promise<Array<{ name: string }>> {
  const res = await ghApi(`https://api.github.com/repos/${OWNER}/${ORDERS_REPO}/contents/orders`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data.map((x: any) => ({ name: x.name })) : [];
}

// Binary-safe write for images: pass base64 content straight to GitHub API
export async function writeStoreBase64(path: string, base64Content: string, message: string) {
  const existing = await readStoreText(path);
  const body: any = { message, content: base64Content, branch: 'master' };
  if (existing?.sha) body.sha = existing.sha;
  const res = await ghApi(`https://api.github.com/repos/${OWNER}/${STORE_REPO}/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`write binary ${path}: HTTP ${res.status} ${t.slice(0, 120)}`);
  }
}
