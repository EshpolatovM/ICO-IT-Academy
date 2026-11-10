import { ParentGrantsService } from './parent-grants.service.js';

import type { ParentTokenCrypto } from './parent-token-crypto.service.js';
import type { ParentTokenValidityCache } from './parent-token-validity.service.js';
import type { ParentAccessTokensRepository } from '../repositories/parent-access-tokens.repository.js';

const grant = (tokenId: string, studentId: string) => ({
  tokenId,
  studentId,
  firstName: 'Ali',
  lastName: 'V',
});

function setup(cache: Record<string, string> = {}) {
  const tokens = {
    findGrantsByHashes: jest.fn().mockResolvedValue([
      { ...grant('t2', 's2'), tokenHash: 'h:B' },
      { ...grant('t1', 's1'), tokenHash: 'h:A' },
    ]),
    findGrantsByIds: jest.fn().mockResolvedValue([grant('t2', 's2')]),
    recordExchange: jest.fn().mockResolvedValue(undefined),
  };
  const crypto = { hash: (token: string) => `h:${token}` };
  const validity = {
    read: jest.fn((id: string) => Promise.resolve(cache[id] ?? null)),
    remember: jest.fn().mockResolvedValue(undefined),
  };
  const service = new ParentGrantsService(
    tokens as unknown as ParentAccessTokensRepository,
    crypto as unknown as ParentTokenCrypto,
    validity as unknown as ParentTokenValidityCache,
  );
  return { service, tokens, validity };
}

describe('ParentGrantsService', () => {
  it("xom tokenlar HMAC bo'yicha topiladi, kirish tartibida; topilmaganlar tushib qoladi", async () => {
    const { service, tokens } = setup();

    await expect(service.findByRawTokens(['A', 'X', 'B'])).resolves.toEqual([
      { ...grant('t1', 's1'), token: 'A' },
      { ...grant('t2', 's2'), token: 'B' },
    ]);
    expect(tokens.findGrantsByHashes).toHaveBeenCalledWith(['h:A', 'h:X', 'h:B'], expect.any(Date));
  });

  it('faollik: avval Redis kesh, topilmaganlari bazadan (va keshlanadi)', async () => {
    const { service, tokens, validity } = setup({ t1: 's1' });

    const active = await service.activeStudentsByTokenIds(['t1', 't2', 't3', 't1']);

    expect([...active.entries()]).toEqual([
      ['t1', 's1'],
      ['t2', 's2'],
    ]);
    expect(tokens.findGrantsByIds).toHaveBeenCalledWith(['t2', 't3'], expect.any(Date));
    expect(validity.remember).toHaveBeenCalledWith('t2', 's2');
  });

  it("hammasi keshda — bazaga murojaat yo'q", async () => {
    const { service, tokens } = setup({ t1: 's1' });

    await service.activeStudentsByTokenIds(['t1']);
    expect(tokens.findGrantsByIds).not.toHaveBeenCalled();
  });
});
