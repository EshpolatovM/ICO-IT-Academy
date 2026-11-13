import Image from 'next/image';

import { cn } from '@/lib/cn';
import { SAFE_IMAGE_PROTOCOLS, SAFE_LINK_PROTOCOLS, isExternalUrl, toSafeUrl } from '@/lib/safeUrl';

import { Heading } from './Heading';
import { Table, TableBody, TableCell, TableHeader, TableRow } from './Table';
import { TableHead } from './TableHead';
import { Text } from './Text';
import { TextLink } from './TextLink';

import type { CSSProperties, ReactNode } from 'react';
import type { Components } from 'react-markdown';

/** react-markdown har bir komponentga beradigan umumiy props (`node` ataylab olib tashlanadi). */
interface ElementProps {
  children?: ReactNode;
  style?: CSSProperties;
}

type CellAlign = 'left' | 'center' | 'right';

const alignClasses: Record<CellAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/** GFM jadval hizalanishi (`style.textAlign`) inline style emas, token klassiga aylantiriladi. */
function alignClass(style: CSSProperties | undefined): string | undefined {
  const align = style?.textAlign;
  return align === 'left' || align === 'center' || align === 'right'
    ? alignClasses[align]
    : undefined;
}

interface SafeLinkProps {
  href: string | undefined;
  children?: ReactNode;
}

/** Faqat http/https/mailto havolalar `<a>` bo'ladi; qolganlari oddiy matn bo'lib qoladi. */
export function SafeLink({ href, children }: SafeLinkProps) {
  const safeHref = toSafeUrl(href, SAFE_LINK_PROTOCOLS);
  if (safeHref === null) {
    return <span>{children}</span>;
  }
  return (
    <TextLink href={safeHref} external={isExternalUrl(safeHref)} className="underline">
      {children}
    </TextLink>
  );
}

interface SafeImageProps {
  src: unknown;
  alt: string | undefined;
}

/** Faqat `https:` rasm ko'rsatiladi; aks holda alt matnli havola (yoki oddiy matn). */
export function SafeImage({ src, alt }: SafeImageProps) {
  const rawSrc = typeof src === 'string' ? src : undefined;
  const label = alt !== undefined && alt !== '' ? alt : 'Rasm';
  const safeSrc = toSafeUrl(rawSrc, SAFE_IMAGE_PROTOCOLS);
  if (safeSrc === null) {
    return <SafeLink href={rawSrc}>{label}</SafeLink>;
  }
  return (
    <Image
      src={safeSrc}
      alt={alt ?? ''}
      width={0}
      height={0}
      unoptimized
      referrerPolicy="no-referrer"
      className="inline-block h-auto w-auto max-w-full rounded-md border border-border"
    />
  );
}

const listClasses = 'flex flex-col gap-1 pl-6 text-base text-text';

/** Markdown elementlari → token'lar asosidagi UI komponentlar (wireframe uslubi). */
export const markdownComponents: Components = {
  h1: ({ children }: ElementProps) => <Heading as="h1">{children}</Heading>,
  h2: ({ children }: ElementProps) => <Heading as="h2">{children}</Heading>,
  h3: ({ children }: ElementProps) => <Heading as="h3">{children}</Heading>,
  h4: ({ children }: ElementProps) => <Heading as="h4">{children}</Heading>,
  h5: ({ children }: ElementProps) => <Heading as="h4">{children}</Heading>,
  h6: ({ children }: ElementProps) => <Heading as="h4">{children}</Heading>,
  p: ({ children }: ElementProps) => <Text>{children}</Text>,
  a: ({ href, children }) => <SafeLink href={href}>{children}</SafeLink>,
  img: ({ src, alt }) => <SafeImage src={src} alt={alt} />,
  ul: ({ children }: ElementProps) => <ul className={cn('list-disc', listClasses)}>{children}</ul>,
  ol: ({ children }: ElementProps) => (
    <ol className={cn('list-decimal', listClasses)}>{children}</ol>
  ),
  li: ({ children }: ElementProps) => <li>{children}</li>,
  blockquote: ({ children }: ElementProps) => (
    <blockquote className="flex flex-col gap-2 border-l-4 border-border pl-4 text-text-muted">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-border" />,
  pre: ({ children }: ElementProps) => (
    <pre className="overflow-x-auto rounded-md border border-border bg-surface p-3 font-mono text-sm text-text *:bg-transparent *:p-0">
      {children}
    </pre>
  ),
  code: ({ children }: ElementProps) => (
    <code className="rounded-sm bg-surface-muted px-1 font-mono text-sm text-text">{children}</code>
  ),
  table: ({ children }: ElementProps) => <Table>{children}</Table>,
  thead: ({ children }: ElementProps) => <TableHeader>{children}</TableHeader>,
  tbody: ({ children }: ElementProps) => <TableBody>{children}</TableBody>,
  tr: ({ children }: ElementProps) => <TableRow>{children}</TableRow>,
  th: ({ children, style }: ElementProps) => (
    <TableHead className={alignClass(style)}>{children}</TableHead>
  ),
  td: ({ children, style }: ElementProps) => (
    <TableCell className={alignClass(style)}>{children}</TableCell>
  ),
};
