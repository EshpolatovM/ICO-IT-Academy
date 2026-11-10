import { TimeoutError, withTimeout } from './with-timeout.js';

describe('withTimeout', () => {
  it('vaqtida tugagan natijani qaytaradi', async () => {
    await expect(withTimeout(Promise.resolve(42), 50)).resolves.toBe(42);
  });

  it('asl xatoni uzatadi', async () => {
    await expect(withTimeout(Promise.reject(new Error('x')), 50)).rejects.toThrow('x');
  });

  it("vaqt o'tsa TimeoutError", async () => {
    const never = new Promise<never>(() => undefined);

    await expect(withTimeout(never, 10)).rejects.toBeInstanceOf(TimeoutError);
  });
});
