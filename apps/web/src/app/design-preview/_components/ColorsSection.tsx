import { Stack, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import { PreviewSection } from './PreviewSection';
import { TokenValue } from './TokenValue';

interface ColorToken {
  name: string;
  /** Tailwind klassi literal holda (Tailwind faqat to'liq yozilgan klasslarni ko'radi). */
  swatchClass: string;
}

const COLOR_TOKENS: readonly ColorToken[] = [
  { name: '--color-primary', swatchClass: 'bg-primary' },
  { name: '--color-primary-hover', swatchClass: 'bg-primary-hover' },
  { name: '--color-primary-fg', swatchClass: 'bg-primary-fg' },
  { name: '--color-bg', swatchClass: 'bg-bg' },
  { name: '--color-surface', swatchClass: 'bg-surface' },
  { name: '--color-surface-muted', swatchClass: 'bg-surface-muted' },
  { name: '--color-text', swatchClass: 'bg-text' },
  { name: '--color-text-muted', swatchClass: 'bg-text-muted' },
  { name: '--color-text-disabled', swatchClass: 'bg-text-disabled' },
  { name: '--color-border', swatchClass: 'bg-border' },
  { name: '--color-border-muted', swatchClass: 'bg-border-muted' },
  { name: '--color-danger', swatchClass: 'bg-danger' },
  { name: '--color-danger-bg', swatchClass: 'bg-danger-bg' },
  { name: '--color-success', swatchClass: 'bg-success' },
  { name: '--color-success-bg', swatchClass: 'bg-success-bg' },
  { name: '--color-warning', swatchClass: 'bg-warning' },
  { name: '--color-warning-bg', swatchClass: 'bg-warning-bg' },
  { name: '--color-info', swatchClass: 'bg-info' },
  { name: '--color-info-bg', swatchClass: 'bg-info-bg' },
  { name: '--color-focus-ring', swatchClass: 'bg-focus-ring' },
];

/** Rang palitrasi: token nomi, namuna va `tokens.css` dagi qiymat. */
export function ColorsSection() {
  return (
    <PreviewSection id="colors" title="Ranglar" description="Semantik rang token'lari.">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COLOR_TOKENS.map((token) => (
          <li key={token.name}>
            <Stack direction="horizontal" gap="3" align="center">
              <span
                aria-hidden="true"
                className={cn(
                  'size-10 shrink-0 rounded-md border border-border',
                  token.swatchClass,
                )}
              />
              <Stack gap="none">
                <Text as="span" variant="muted" className="font-mono">
                  {token.name}
                </Text>
                <TokenValue name={token.name} />
              </Stack>
            </Stack>
          </li>
        ))}
      </ul>
    </PreviewSection>
  );
}
