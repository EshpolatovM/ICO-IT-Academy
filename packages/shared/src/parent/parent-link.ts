import {
  PARENT_LINK_FRAGMENT_PREFIX,
  PARENT_LINK_PATH,
  PARENT_LINK_TOKEN_PARAM,
} from './parent-token.constants.js';

const FRAGMENT_MARK = '#';
const PAIR_SEPARATOR = '&';
const KEY_VALUE_SEPARATOR = '=';

/**
 * Ota-ona havolasini yasaydi: `${webBaseUrl}/parent#t=<token>` (S-70).
 * Token base64url (`[A-Za-z0-9_-]`) — `encodeURIComponent` unga ta'sir qilmaydi, lekin token formati
 * o'zgarsa ham fragment buzilmasligini kafolatlaydi (`parseParentLinkFragment` bilan simmetrik).
 * `webBaseUrl` oxiridagi `/` siz bo'lishi kerak (API'da env sxemasi kesadi).
 */
export function buildParentLink(webBaseUrl: string, token: string): string {
  return `${webBaseUrl}${PARENT_LINK_PATH}${PARENT_LINK_FRAGMENT_PREFIX}${encodeURIComponent(token)}`;
}

/**
 * `location.hash` (`#t=...` yoki `t=...`) dan tokenni ajratadi. Topilmasa yoki noto'g'ri
 * kodlangan bo'lsa `null`. Format tekshiruvi (`parentTokenSchema`) chaqiruvchining ishi.
 */
export function parseParentLinkFragment(hash: string): string | null {
  const body = hash.startsWith(FRAGMENT_MARK) ? hash.slice(FRAGMENT_MARK.length) : hash;
  const keyPrefix = `${PARENT_LINK_TOKEN_PARAM}${KEY_VALUE_SEPARATOR}`;
  const pair = body.split(PAIR_SEPARATOR).find((part) => part.startsWith(keyPrefix));
  if (pair === undefined) {
    return null;
  }
  try {
    const token = decodeURIComponent(pair.slice(keyPrefix.length));
    return token === '' ? null : token;
  } catch {
    return null;
  }
}
