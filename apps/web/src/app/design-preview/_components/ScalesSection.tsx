import { Stack, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import { PreviewSection } from './PreviewSection';
import { TokenValue } from './TokenValue';

interface ScaleItem {
  name: string;
  className: string;
}

const TYPE_SCALE: readonly ScaleItem[] = [
  { name: '--text-3xl', className: 'text-3xl' },
  { name: '--text-2xl', className: 'text-2xl' },
  { name: '--text-xl', className: 'text-xl' },
  { name: '--text-lg', className: 'text-lg' },
  { name: '--text-base', className: 'text-base' },
  { name: '--text-sm', className: 'text-sm' },
  { name: '--text-xs', className: 'text-xs' },
];

const FONT_WEIGHTS: readonly ScaleItem[] = [
  { name: 'font-normal', className: 'font-normal' },
  { name: 'font-medium', className: 'font-medium' },
  { name: 'font-semibold', className: 'font-semibold' },
  { name: 'font-bold', className: 'font-bold' },
];

/** Bo'shliq namunalari: Tailwind 4px shkalasi (`--spacing` × qadam). */
const SPACING_SCALE: readonly ScaleItem[] = [
  { name: '1', className: 'w-1' },
  { name: '2', className: 'w-2' },
  { name: '3', className: 'w-3' },
  { name: '4', className: 'w-4' },
  { name: '6', className: 'w-6' },
  { name: '8', className: 'w-8' },
  { name: '12', className: 'w-12' },
  { name: '16', className: 'w-16' },
];

const RADII: readonly ScaleItem[] = [
  { name: '--radius-sm', className: 'rounded-sm' },
  { name: '--radius-md', className: 'rounded-md' },
  { name: '--radius-lg', className: 'rounded-lg' },
];

function TypographyScale() {
  return (
    <Stack gap="3">
      <Text variant="muted">
        Shrift: <TokenValue name="--font-sans" />
      </Text>
      {TYPE_SCALE.map((item) => (
        <Stack key={item.name} direction="horizontal" gap="4" align="center">
          <Text as="span" variant="small" className="w-24 shrink-0 font-mono">
            {item.name}
          </Text>
          <span className={cn('text-text', item.className)}>ICO IT Academy — ilm yo&apos;li</span>
        </Stack>
      ))}
      <Stack direction="horizontal" gap="4" wrap>
        {FONT_WEIGHTS.map((item) => (
          <span key={item.name} className={cn('text-base text-text', item.className)}>
            {item.name}
          </span>
        ))}
      </Stack>
      <span className="font-mono text-sm text-text">font-mono: const xp = 10;</span>
    </Stack>
  );
}

function SpacingScale() {
  return (
    <Stack gap="2">
      <Text variant="muted">
        Bo&apos;shliq qadami (<span className="font-mono">--spacing</span>):{' '}
        <TokenValue name="--spacing" />
      </Text>
      {SPACING_SCALE.map((item) => (
        <Stack key={item.name} direction="horizontal" gap="4" align="center">
          <Text as="span" variant="small" className="w-12 shrink-0 font-mono">
            {item.name}
          </Text>
          <span aria-hidden="true" className={cn('h-4 bg-primary', item.className)} />
        </Stack>
      ))}
    </Stack>
  );
}

function RadiusAndShadow() {
  return (
    <Stack direction="horizontal" gap="6" wrap>
      {RADII.map((item) => (
        <Stack key={item.name} gap="2" align="center">
          <span
            aria-hidden="true"
            className={cn('size-16 border border-border bg-surface-muted', item.className)}
          />
          <Text as="span" variant="small" className="font-mono">
            {item.name}
          </Text>
          <TokenValue name={item.name} />
        </Stack>
      ))}
      <Stack gap="2" align="center">
        <span aria-hidden="true" className="size-16 rounded-md bg-bg shadow-sm" />
        <Text as="span" variant="small" className="font-mono">
          --shadow-sm
        </Text>
      </Stack>
    </Stack>
  );
}

/** Tipografiya, bo'shliq, radius va soya shkalalari. */
export function ScalesSection() {
  return (
    <>
      <PreviewSection id="typography" title="Tipografiya">
        <TypographyScale />
      </PreviewSection>
      <PreviewSection id="spacing" title="Bo'shliqlar">
        <SpacingScale />
      </PreviewSection>
      <PreviewSection id="radius" title="Radius va soya">
        <RadiusAndShadow />
      </PreviewSection>
    </>
  );
}
