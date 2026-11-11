import { PARENT_LINK_TOKEN_PARAM, parseParentLinkFragment } from '@lms/shared';

/** Havoladagi token qayerdan olingani: `#t=` (S-70) yoki eski `?t=` (orqaga moslik). */
export type ParentLinkTokenSource = 'fragment' | 'query';

export interface ParentLinkToken {
  token: string;
  source: ParentLinkTokenSource;
}

interface ParentLinkLocation {
  hash: string;
  searchParams: Pick<URLSearchParams, 'get'>;
}

/**
 * Ota-ona havolasidan xom tokenni o'qiydi (docs/02 §5.1, S-70): avval fragment (`#t=`), bo'lmasa
 * eski `?t=` query. Format tekshiruvi (`parentTokenSchema`) bu yerda emas — sessiya qatlamida.
 */
export function readParentLinkToken({
  hash,
  searchParams,
}: ParentLinkLocation): ParentLinkToken | null {
  const fragmentToken = parseParentLinkFragment(hash);
  if (fragmentToken !== null) {
    return { token: fragmentToken, source: 'fragment' };
  }
  const queryToken = searchParams.get(PARENT_LINK_TOKEN_PARAM);
  return queryToken === null ? null : { token: queryToken, source: 'query' };
}
