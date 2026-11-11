'use client';

import { useEffect, useState } from 'react';

import { Text } from '@/components/ui';

interface TokenValueProps {
  /** CSS o'zgaruvchisi nomi, masalan `--color-primary`. */
  name: string;
}

/**
 * Token qiymatini `tokens.css` dan (`:root` dagi CSS o'zgaruvchisi) brauzerda o'qiydi —
 * qiymatlar bu yerda takror yozilmaydi.
 */
export function TokenValue({ name }: TokenValueProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(getComputedStyle(document.documentElement).getPropertyValue(name).trim());
  }, [name]);

  return (
    <Text as="span" variant="small" className="font-mono">
      {value === '' ? '…' : value}
    </Text>
  );
}
