import { ParentExchangeRateLimiter } from './parent-exchange-rate-limiter.service.js';

import type { AppConfigService } from '../../../common/config/app-config.service.js';
import type { FixedWindowRateLimiter } from '../../../common/rate-limit/fixed-window-rate-limiter.service.js';

const SETTINGS: Record<string, number> = {
  PARENT_EXCHANGE_MAX_ATTEMPTS: 10,
  PARENT_EXCHANGE_WINDOW_SECONDS: 900,
  PARENT_EXCHANGE_MAX_FAILURES: 20,
  PARENT_EXCHANGE_BLOCK_SECONDS: 3600,
};

function setup() {
  const limiter = {
    assertAllowed: jest.fn().mockResolvedValue(undefined),
    hit: jest.fn().mockResolvedValue(1),
  };
  const config = { get: (key: string) => SETTINGS[key] } as unknown as AppConfigService;
  return {
    limiter,
    service: new ParentExchangeRateLimiter(limiter as unknown as FixedWindowRateLimiter, config),
  };
}

const attempts = {
  keyPrefix: 'auth:parent-exchange:attempts:',
  maxHits: 10,
  windowSeconds: 900,
};
const failures = {
  keyPrefix: 'auth:parent-exchange:failures:',
  maxHits: 20,
  windowSeconds: 3600,
  blockSeconds: 3600,
};

describe('ParentExchangeRateLimiter', () => {
  it("urinish: avval blok, keyin urinishlar limiti tekshiriladi, so'ng hisoblanadi (IP bo'yicha)", async () => {
    const { limiter, service } = setup();

    await service.consumeAttempt('10.0.0.1');

    expect(limiter.assertAllowed).toHaveBeenNthCalledWith(1, failures, '10.0.0.1');
    expect(limiter.assertAllowed).toHaveBeenNthCalledWith(2, attempts, '10.0.0.1');
    expect(limiter.hit).toHaveBeenCalledWith(attempts, '10.0.0.1');
  });

  it("muvaffaqiyatsizlik — 20 tadan keyin 1 soatlik blok policy'si bilan; IP yo'q — 'unknown'", async () => {
    const { limiter, service } = setup();

    await service.registerFailure(null);

    expect(limiter.hit).toHaveBeenCalledWith(failures, 'unknown');
  });
});
