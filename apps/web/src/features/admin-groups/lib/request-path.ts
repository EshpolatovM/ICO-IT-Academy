/** `/bosh/yo'l` + query satri (bo'sh bo'lsa — faqat yo'l). */
export function pathWithSearch(path: string, search: URLSearchParams): string {
  const query = search.toString();
  return query.length > 0 ? `${path}?${query}` : path;
}

/** `/bosh/yo'l/:id` — id URL segmenti sifatida kodlanadi. */
export function itemPath(basePath: string, id: string): string {
  return `${basePath}/${encodeURIComponent(id)}`;
}
