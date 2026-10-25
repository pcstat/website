/**
 * Browser loaders for certificates. They are read from the certificate registry (`certificates` in database.json; see
 * CERTIFICATES_BASE_URL): from its deployment link when it has one, otherwise from its (possibly private) GitHub repo
 * through this site's proxy (functions/api/github), never from the content database and never at build time — a
 * certificate is verifiable as soon as it is committed, without rebuilding this website.
 *
 * Certificates are stored one file per SET ("PY26", "CONTEST26"), and an ID is SPC-<set code>-<person id>:
 *   sets/<code>.json       { code, certificate: <what every certificate of the set shares>, people: { <person id>: <the person> } }
 *   templates/<name>.svg   the certificate designs
 * So verifying "spc py26 7w34n" opens exactly sets/py26.json, reads the person "7W34N" in it and merges the two parts
 * (resolveCertificate) — nothing is searched, however many sets exist.
 */
import { CERTIFICATES_BASE_URL } from '../config';
import { PROXY_PREFIX } from '../github-source';
import { resolveCertificate, setFileName, splitId, type CertificateRecord, type SetFile } from './core';

export const certificatesEnabled = CERTIFICATES_BASE_URL !== '';

/** The registry's site cannot be reached at all (not deployed yet, wrong address in database.json, offline …). */
export class RegistryUnreachableError extends Error {}

const unreachable = () => new RegistryUnreachableError(`Could not reach the certificate registry at ${CERTIFICATES_BASE_URL} — does the repository in "certificates" of database.json exist, are its files pushed, and is the DATA_READ_TOKEN secret set if the repo is private?`);

/** True when the registry can be read at all: templates/manifest.json exists in every registry (the repo itself or a built copy). */
async function registryReachable(): Promise<boolean> {
  try {
    return (await fetch(`${CERTIFICATES_BASE_URL}templates/manifest.json`, { cache: 'no-cache' })).ok;
  } catch {
    return false;
  }
}

const sets = new Map<string, Promise<SetFile | null>>();

/** True when the registry is read through the site's proxy, which hands out one person of a set at a time. */
const viaProxy = CERTIFICATES_BASE_URL.includes(PROXY_PREFIX);

/**
 * One set file; null when the registry has no such set (a 404 — an ID whose set was never created).
 * Through the proxy the file only contains the one person asked for (`person`); from a deployment link it is whole.
 */
function loadSet(code: string, person: string): Promise<SetFile | null> {
  const cacheKey = viaProxy ? `${code}/${person}` : code;
  const hit = sets.get(cacheKey);
  if (hit) return hit;
  const loading = (async () => {
    let res: Response | null = null;
    try {
      const query = viaProxy ? `?person=${encodeURIComponent(person)}` : '';
      res = await fetch(`${CERTIFICATES_BASE_URL}sets/${setFileName(code)}${query}`, { cache: 'no-cache' });
    } catch {
      // The browser hides responses that lack the CORS header, and GitHub / Cloudflare Pages add that header only to
      // files that exist — so a set that does NOT exist can also end up here. Decided below.
    }
    if (res?.ok) return (await res.json()) as SetFile;
    if (!res || res.status === 404) {
      // "Not found" is only an answer when the registry itself can be read: templates/manifest.json exists in every
      // registry. If it cannot be read, the registry is missing or offline and nothing can be said about the ID.
      if (!(await registryReachable())) throw unreachable();
      return null;
    }
    throw new Error(`HTTP ${res.status} loading certificate set ${code}`);
  })();
  sets.set(cacheKey, loading);
  loading.catch(() => sets.delete(cacheKey)); // a failed load must not stay cached
  return loading;
}

/**
 * Looks a certificate up by whatever was typed (any case, with or without dashes or spaces).
 * Resolves to null when no such certificate exists; rejects when the registry cannot be reached.
 */
export async function findCertificate(input: string): Promise<CertificateRecord | null> {
  if (!certificatesEnabled) throw new Error('Certificate verification is not configured (see "certificates" in database.json).');
  const parts = splitId(input);
  if (!parts) return null;
  const set = await loadSet(parts.set, parts.person);
  return set ? resolveCertificate(set, parts.person) : null;
}

/** The SVG text of a template. The name comes from data, so only plain file names are accepted. */
export async function loadTemplate(file: string): Promise<string> {
  if (!/^[A-Za-z0-9_.-]+\.svg$/.test(file)) throw new Error(`Invalid template name "${file}".`);
  let res: Response;
  try {
    res = await fetch(`${CERTIFICATES_BASE_URL}templates/${file}`, { cache: 'no-cache' });
  } catch {
    throw unreachable();
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} loading template ${file}`);
  return res.text();
}
