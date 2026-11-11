import { act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@lms/shared';

import { ApiError } from '@/lib/api';
import { expectSecretNotCached } from '@/lib/testing/query-cache';
import { renderHookWithQuery } from '@/lib/testing/render';

import { useSecretMutation } from './useSecretMutation';

const SECRET = { temporaryPassword: 'q7Lm2xPa9z' };

describe('useSecretMutation', () => {
  it("natija faqat hook holatida — mutatsiya va query keshida parol yo'q", async () => {
    const reset = vi.fn().mockResolvedValue(SECRET);
    const { result, queryClient } = renderHookWithQuery(() =>
      useSecretMutation(reset, ['admin-users', 'students']),
    );
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      await result.current.run('u1');
    });

    expect(reset).toHaveBeenCalledWith('u1', expect.anything());
    expect(result.current.result).toEqual(SECRET);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['admin-users', 'students'] });
    await expectSecretNotCached(queryClient, SECRET.temporaryPassword);

    act(() => {
      result.current.clear();
    });
    expect(result.current.result).toBeNull();
  });

  it('xatoda — tashlaydi va `error` da qoladi; clear() tozalaydi', async () => {
    const failure = new ApiError({
      status: 403,
      code: ErrorCode.FORBIDDEN,
      message: "Ruxsat yo'q",
    });
    const { result } = renderHookWithQuery(() =>
      useSecretMutation(vi.fn().mockRejectedValue(failure)),
    );

    await act(async () => {
      await expect(result.current.run('u1')).rejects.toBe(failure);
    });
    await waitFor(() => {
      expect(result.current.error).toBe(failure);
    });
    expect(result.current.result).toBeNull();

    act(() => {
      result.current.clear();
    });
    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
  });

  it('invalidateKey berilmasa — hech qaysi query bekor qilinmaydi', async () => {
    const { result, queryClient } = renderHookWithQuery(() =>
      useSecretMutation(vi.fn().mockResolvedValue(SECRET)),
    );
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      await result.current.run('u1');
    });

    expect(result.current.result).toEqual(SECRET);
    expect(invalidate).not.toHaveBeenCalled();
  });
});
