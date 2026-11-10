import { randomUUID } from 'node:crypto';

import {
  REDACT_CENSOR,
  REDACT_PATHS,
  REQUEST_ID_HEADER,
  REQUEST_ID_LOG_KEY,
  REQUEST_ID_PATTERN,
} from './logger.constants.js';

import type { IncomingMessage, ServerResponse } from 'node:http';
import type { LevelWithSilent } from 'pino';
import type { Options } from 'pino-http';

/** Kiruvchi `x-request-id` (to'g'ri formatda bo'lsa) yoki yangi UUID; javob sarlavhasiga ham yoziladi. */
export function resolveRequestId(req: IncomingMessage, res: ServerResponse): string {
  const incoming = req.headers[REQUEST_ID_HEADER];
  const requestId =
    typeof incoming === 'string' && REQUEST_ID_PATTERN.test(incoming) ? incoming : randomUUID();
  res.setHeader(REQUEST_ID_HEADER, requestId);
  return requestId;
}

/** pino-http sozlamalari: JSON log, `requestId`, maxfiy maydonlar redact (docs/13 §8, §9). */
export function buildPinoHttpOptions(level: LevelWithSilent): Options {
  return {
    level,
    genReqId: resolveRequestId,
    // So'rov ichidagi barcha loglarga (servislar ham) `requestId` qo'shiladi.
    customProps: (req) => ({ [REQUEST_ID_LOG_KEY]: req.id }),
    redact: { paths: [...REDACT_PATHS], censor: REDACT_CENSOR },
  };
}
