/**
 * Foydalanuvchi kontentidagi (Markdown) URL'lar uchun xavfsiz protokollar ro'yxati — web ichida
 * yagona manba. `javascript:`, `data:`, `vbscript:` va nisbiy URL'lar o'tkazilmaydi.
 */
export const SAFE_LINK_PROTOCOLS = ['http:', 'https:', 'mailto:'] as const;

/** Rasmlar (va video havolalari) faqat `https:` (docs/reviews/03-reja-frontend-izoh.md, Q-10). */
export const SAFE_IMAGE_PROTOCOLS = ['https:'] as const;

/** Yangi oynada ochiladigan tashqi havola protokollari. */
export const EXTERNAL_LINK_PROTOCOLS = ['http:', 'https:'] as const;

/**
 * URL'ni tahlil qilib, protokoli ro'yxatda bo'lsa normallashtirilgan `href` ni qaytaradi, aks holda
 * `null`. Brauzer URL parser'i ishlatiladi: `java\tscript:` kabi yashirish usullari ham ushlanadi.
 */
export function toSafeUrl(
  url: string | null | undefined,
  protocols: readonly string[],
): string | null {
  if (url === null || url === undefined || url.trim() === '') {
    return null;
  }
  try {
    const parsed = new URL(url.trim());
    return protocols.includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
}

/** URL tashqi (http/https) havolami — `target="_blank"` kerakligini aniqlash uchun. */
export function isExternalUrl(url: string): boolean {
  return toSafeUrl(url, EXTERNAL_LINK_PROTOCOLS) !== null;
}
