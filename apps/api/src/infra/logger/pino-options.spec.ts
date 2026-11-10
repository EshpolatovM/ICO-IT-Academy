import { Writable } from 'node:stream';

import { pino } from 'pino';

import { REQUEST_ID_HEADER } from './logger.constants.js';
import { buildPinoHttpOptions, resolveRequestId } from './pino-options.js';

import type { IncomingMessage, ServerResponse } from 'node:http';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function requestWith(headers: Record<string, string>) {
  const setHeader = jest.fn();
  return {
    req: { headers } as unknown as IncomingMessage,
    res: { setHeader } as unknown as ServerResponse,
    setHeader,
  };
}

describe('resolveRequestId', () => {
  it("kiruvchi x-request-id ni qayta ishlatadi va javobga qo'yadi", () => {
    const { req, res, setHeader } = requestWith({ [REQUEST_ID_HEADER]: 'abc-123' });

    expect(resolveRequestId(req, res)).toBe('abc-123');
    expect(setHeader).toHaveBeenCalledWith(REQUEST_ID_HEADER, 'abc-123');
  });

  it("yo'q yoki noto'g'ri formatda bo'lsa yangi UUID generatsiya qiladi", () => {
    const missing = requestWith({});
    const injected = requestWith({ [REQUEST_ID_HEADER]: 'bad\nlog line' });

    expect(resolveRequestId(missing.req, missing.res)).toMatch(UUID_PATTERN);
    expect(resolveRequestId(injected.req, injected.res)).toMatch(UUID_PATTERN);
  });
});

describe('buildPinoHttpOptions — redact', () => {
  it('parol, token va auth sarlavhalari logga yozilmaydi', () => {
    const lines: string[] = [];
    const stream = new Writable({
      write(chunk: Buffer, _encoding, callback) {
        lines.push(chunk.toString());
        callback();
      },
    });
    const options = buildPinoHttpOptions('info');
    const logger = pino({ level: 'info', redact: options.redact }, stream);

    logger.info({
      req: { headers: { authorization: 'Bearer secret-jwt', cookie: 'rt=secret-rt' } },
      body: { password: 'secret-pass', newPassword: 'secret-new', token: 'secret-token' },
      accessToken: 'secret-access',
    });

    const output = lines.join('');
    expect(output).not.toMatch(/secret-/);
    expect(output).toContain('[Redacted]');
  });

  it('requestId kaliti va daraja sozlanadi', () => {
    const options = buildPinoHttpOptions('debug');

    expect(options.level).toBe('debug');
    const req = { id: 'req-7' } as unknown as IncomingMessage;
    expect(options.customProps?.(req, {} as ServerResponse)).toEqual({ requestId: 'req-7' });
  });
});
