'use client';

import { useCallback, useState } from 'react';

export type CopyStatus = 'idle' | 'copied' | 'error';

/** Matnni `navigator.clipboard` orqali nusxalaydi va natija holatini qaytaradi. */
export function useCopyToClipboard(): {
  status: CopyStatus;
  copy: (text: string) => Promise<void>;
} {
  const [status, setStatus] = useState<CopyStatus>('idle');

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  }, []);

  return { status, copy };
}
