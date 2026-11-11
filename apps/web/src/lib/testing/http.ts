import { vi } from 'vitest';

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
