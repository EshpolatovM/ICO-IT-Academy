/** Yo'lga query satrini qo'shadi (bo'sh bo'lsa — o'zgarishsiz). */
export function withQuery(path: string, query: URLSearchParams): string {
  const search = query.toString();
  return search === '' ? path : `${path}?${search}`;
}

/** URL segmenti sifatida xavfsiz id. */
export function idSegment(id: string): string {
  return encodeURIComponent(id);
}
