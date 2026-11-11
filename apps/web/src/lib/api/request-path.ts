/** Yo'lga query satrini qo'shadi (bo'sh bo'lsa — o'zgarishsiz). */
export function withQuery(path: string, query: URLSearchParams): string {
  const search = query.toString();
  return search === '' ? path : `${path}?${search}`;
}

/** `/bosh/yo'l/:id` — id URL segmenti sifatida kodlanadi. */
export function itemPath(basePath: string, id: string): string {
  return `${basePath}/${encodeURIComponent(id)}`;
}
