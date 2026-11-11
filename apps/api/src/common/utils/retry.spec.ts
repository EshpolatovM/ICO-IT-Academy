import { retryWithBackoff } from './retry.js';

const OPTIONS = { attempts: 3, backoffMs: 1 };

describe('retryWithBackoff', () => {
  it('birinchi urinish muvaffaqiyatli — bir marta chaqiriladi', async () => {
    const action = jest.fn().mockResolvedValue('ok');

    await expect(retryWithBackoff(action, OPTIONS)).resolves.toBe('ok');
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('vaqtinchalik xatodan keyin qayta urinib natija qaytaradi', async () => {
    const action = jest.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce('ok');

    await expect(retryWithBackoff(action, OPTIONS)).resolves.toBe('ok');
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('urinishlar tugasa — oxirgi xato uzatiladi', async () => {
    const action = jest
      .fn()
      .mockRejectedValueOnce(new Error('1'))
      .mockRejectedValueOnce(new Error('2'))
      .mockRejectedValueOnce(new Error('3'));

    await expect(retryWithBackoff(action, OPTIONS)).rejects.toThrow('3');
    expect(action).toHaveBeenCalledTimes(OPTIONS.attempts);
  });
});
