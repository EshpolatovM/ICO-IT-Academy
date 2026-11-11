import { ParentAccessSuspensionService } from './parent-access-suspension.service.js';

import type { ParentTokenValidityCache } from './parent-token-validity.service.js';
import type { ParentAccessTokensRepository } from '../repositories/parent-access-tokens.repository.js';

function setup() {
  const tokens = { listActiveIds: jest.fn().mockResolvedValue(['t1', 't2']) };
  const validity = {
    markRevoked: jest.fn().mockResolvedValue(undefined),
    clearRevoked: jest.fn().mockResolvedValue(undefined),
  };
  const service = new ParentAccessSuspensionService(
    tokens as unknown as ParentAccessTokensRepository,
    validity as unknown as ParentTokenValidityCache,
  );
  return { service, tokens, validity };
}

describe('ParentAccessSuspensionService', () => {
  it("to'xtatish: studentning faol tokenlariga tombstone (bazada bekor qilinmaydi)", async () => {
    const { service, tokens, validity } = setup();

    await service.suspendStudent('s1');

    expect(tokens.listActiveIds).toHaveBeenCalledWith('s1', expect.any(Date));
    expect(validity.markRevoked.mock.calls).toEqual([['t1'], ['t2']]);
  });

  it('tiklash: tombstone olib tashlanadi', async () => {
    const { service, validity } = setup();

    await service.resumeStudent('s1');

    expect(validity.clearRevoked.mock.calls).toEqual([['t1'], ['t2']]);
  });
});
