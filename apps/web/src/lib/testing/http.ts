import { afterEach, beforeEach, expect, vi } from 'vitest';

import type { Mock } from 'vitest';

/** Testlar uchun JSON javob. */
export function jsonResponse(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Xato javobi (docs/12 §0 formati). */
export function errorResponse(
  status: number,
  code: string,
  message: string,
  details: unknown = null,
): Response {
  return jsonResponse(status, { error: { code, message, details } });
}

export type FetchMock = Mock<typeof fetch>;

/** Global `fetch` ni mock bilan almashtiradi (testdan keyin `vi.unstubAllGlobals()`). */
export function mockFetch(): FetchMock {
  const fetchMock: FetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** `fetch` ning birinchi argumentidan URL satri. */
export function requestUrl(input: RequestInfo | URL): string {
  if (input instanceof Request) {
    return input.url;
  }
  return input instanceof URL ? input.href : input;
}

/** So'rovning JSON body'si (body yo'q bo'lsa — `undefined`). */
export function requestJson(init: RequestInit): unknown {
  return typeof init.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined;
}

/** Berilgan metod bilan yuborilgan oxirgi so'rovning JSON body'si (bo'lmasa — `undefined`). */
export function lastRequestBody(fetchMock: FetchMock, method: string): unknown {
  const call = fetchMock.mock.calls.findLast(([, init]) => init?.method === method);
  return call?.[1] === undefined ? undefined : requestJson(call[1]);
}

/** `fetch` chaqiruvining URL va sozlamalari. */
export function fetchCall(fetchMock: FetchMock, index: number): { url: string; init: RequestInit } {
  const call = fetchMock.mock.calls[index];
  if (call === undefined) {
    throw new Error(`fetch #${String(index)} chaqirilmagan`);
  }
  const [input, init = {}] = call;
  return { url: requestUrl(input), init };
}

/** So'rov sarlavhasi qiymati. */
export function requestHeader(init: RequestInit, name: string): string | null {
  return new Headers(init.headers).get(name);
}

const OK_STATUS = 200;
const NOT_FOUND_STATUS = 404;

/**
 * `describe` ichida: har test oldidan `fetch` mock'i (javob — 200 `{}`), keyin tiklanadi.
 * Qaytgan funksiya joriy testning mock'ini beradi (API qatlami kontrakt testlari uchun).
 */
export function setupJsonFetch(): () => FetchMock {
  let fetchMock: FetchMock = vi.fn<typeof fetch>();
  beforeEach(() => {
    fetchMock = mockFetch();
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(OK_STATUS, {})));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  return () => fetchMock;
}

/** `index`-chi `fetch` chaqiruvi metodi va URL'ini tekshiradi; sozlamalarini qaytaradi. */
export function expectRequest(
  fetchMock: FetchMock,
  index: number,
  method: string,
  url: string,
): RequestInit {
  const { url: actualUrl, init } = fetchCall(fetchMock, index);
  expect(actualUrl).toBe(url);
  expect(init.method ?? 'GET').toBe(method);
  return init;
}

/** `"METHOD /api/v1/yo'l"` (query'siz) → javob yaratuvchi. */
export type FetchRoutes = Record<string, (init: RequestInit) => Response>;

/**
 * `fetch` mock'ini method + yo'l bo'yicha javob beradigan qiladi; noma'lum so'rov — 404.
 * Yo'l query satrisiz solishtiriladi.
 */
export function routeFetch(fetchMock: FetchMock, routes: FetchRoutes): void {
  fetchMock.mockImplementation((input, init = {}) => {
    const path = requestUrl(input).split('?')[0] ?? '';
    const handler = routes[`${init.method ?? 'GET'} ${path}`];
    return Promise.resolve(
      handler === undefined
        ? errorResponse(NOT_FOUND_STATUS, 'NOT_FOUND', `Mock yo'q: ${path}`)
        : handler(init),
    );
  });
}
