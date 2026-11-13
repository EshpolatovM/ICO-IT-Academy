/** API prefiksi (docs/12 §0). Next `rewrites` uni `API_INTERNAL_URL` ga uzatadi — bir xil origin. */
export const API_BASE_PATH = '/api/v1';

/** Kod ishlatadigan HTTP holatlari. */
export const HttpStatus = {
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
} as const;

/** Shu holatdan boshlab — server (yoki proxy) xatosi (5xx). */
export const SERVER_ERROR_MIN_STATUS = 500;

/** Server bilan umuman aloqa bo'lmaganda (`fetch` tarmoq xatosi) `ApiError.status` qiymati. */
export const NETWORK_ERROR_STATUS = 0;

export const NETWORK_ERROR_MESSAGE =
  "Server bilan aloqa yo'q. Internet aloqasini tekshirib, qayta urinib ko'ring.";
export const UNKNOWN_ERROR_MESSAGE = "Kutilmagan xato yuz berdi. Qayta urinib ko'ring.";
