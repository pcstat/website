/**
 * Cloudflare Pages Function: /api/github/<owner>/<repo>/<branch>/<file>
 *
 * Lets the browser read the PRIVATE data repos (database, certificates) without ever holding the access token: the
 * token is the Pages secret `DATA_READ_TOKEN`, added here on the server. (A token that is shipped inside the website
 * is readable by every visitor, so the site never contains one.)
 *
 * It is only used when "url" in database.json is empty (see src/lib/github-source.ts) and it is deliberately narrow:
 *   - only the two repos named in database.json, on the configured branch, GET only;
 *   - database repo: its JSON files and photos, nothing else;
 *   - certificate repo: the templates, and a set file ONLY together with `?person=<person id>`, in which case just that
 *     one person comes back (same shape as the file, one entry) with internal fields (`note`, `ref`) removed. Nobody
 *     can download the whole list of recipients of a set, or guess their way through it.
 * Without a token it still works for public repos.
 */
import databaseConfig from '../../../database.json';
import { foldLookalikes, normalizeId } from '../../../src/lib/certificates/core';

interface Env {
  DATA_READ_TOKEN?: string;
}

interface Context {
  request: Request;
  env: Env;
  params: { path?: string | string[] };
}

interface RepoConfig {
  repo?: string;
  branch?: string;
}

const config = databaseConfig as RepoConfig & { certificates?: RepoConfig };

const DATABASE_FILE = /^(?!package\.json$)(?:[a-z][a-z0-9-]*\.json|members\/[\w.-]+\/[\w.-]+\.json|photos\/(?:[\w.-]+\/)*[\w.-]+\.(?:webp|jpe?g|png|gif|avif|svg))$/i;
const SET_FILE = /^sets\/([0-9a-z]{2,12})\.json$/;
const TEMPLATE_FILE = /^templates\/(?:manifest\.json|[A-Za-z0-9_.-]+\.svg)$/;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

async function upstream(repo: string, branch: string, file: string, token: string | undefined): Promise<Response> {
  const url = `https://raw.githubusercontent.com/${repo}/${branch}/${file.split('/').map(encodeURIComponent).join('/')}`;
  return fetch(url, { headers: token ? { Authorization: `token ${token}` } : undefined, cf: { cacheTtl: 0 } } as RequestInit);
}

export const onRequestGet = async ({ request, env, params }: Context): Promise<Response> => {
  const segments = (Array.isArray(params.path) ? params.path : params.path ? [params.path] : []).map(decodeURIComponent);
  const [owner, name, branch, ...rest] = segments;
  const file = rest.join('/');
  if (!owner || !name || !branch || !file || segments.some((s) => s === '..' || s === '.' || s === '')) return json(404, { error: 'Not found' });

  const repo = `${owner}/${name}`;
  const databaseBranch = config.branch?.trim() || 'main';
  const certificates = config.certificates;
  const certificatesBranch = certificates?.branch?.trim() || 'main';
  const token = env.DATA_READ_TOKEN?.trim() || undefined;

  if (repo === config.repo && branch === databaseBranch) {
    if (!DATABASE_FILE.test(file)) return json(404, { error: 'Not found' });
    const res = await upstream(repo, branch, file, token);
    if (!res.ok) return json(res.status === 404 ? 404 : 502, { error: res.status === 404 ? 'Not found' : `GitHub answered ${res.status}` });
    return new Response(res.body, {
      headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream', 'Cache-Control': 'public, max-age=60' },
    });
  }

  if (certificates?.repo && repo === certificates.repo && branch === certificatesBranch) {
    if (TEMPLATE_FILE.test(file)) {
      const res = await upstream(repo, branch, file, token);
      if (!res.ok) return json(res.status === 404 ? 404 : 502, { error: res.status === 404 ? 'Not found' : `GitHub answered ${res.status}` });
      return new Response(res.body, {
        headers: { 'Content-Type': file.endsWith('.svg') ? 'image/svg+xml; charset=utf-8' : 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }
    if (SET_FILE.test(file)) {
      const person = new URL(request.url).searchParams.get('person');
      if (!person) return json(400, { error: 'A set can only be read for one person (?person=…).' });
      const res = await upstream(repo, branch, file, token);
      if (res.status === 404) return json(404, { error: 'Not found' });
      if (!res.ok) return json(502, { error: `GitHub answered ${res.status}` });
      const set = (await res.json()) as { code: string; certificate: unknown; people: Record<string, Record<string, unknown>> };
      const wanted = foldLookalikes(normalizeId(person));
      const key = Object.keys(set.people ?? {}).find((k) => foldLookalikes(normalizeId(k)) === wanted);
      if (!key) return json(404, { error: 'Not found' });
      const { note: _note, ref: _ref, ...entry } = set.people[key] as Record<string, unknown>;
      return json(200, { code: set.code, certificate: set.certificate, people: { [key]: entry } });
    }
  }

  return json(404, { error: 'Not found' });
};
