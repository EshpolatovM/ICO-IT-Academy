import { cn } from '@/lib/cn';

import { Heading } from './Heading';
import { isPresentNode } from './isPresentNode';
import { Stack } from './Stack';
import { Text } from './Text';
import { TextLink } from './TextLink';

import type { ComponentProps, ReactNode } from 'react';

export interface PageHeaderBackLink {
  href: ComponentProps<typeof TextLink>['href'];
  /** Qayerga qaytishi ("Studentlar"); oldiga "←" qo'shiladi. */
  label: string;
}

export interface PageHeaderProps {
  /** Sahifa sarlavhasi (`<h1>`). */
  title: ReactNode;
  description?: ReactNode;
  /** Sarlavha yonidagi qo'shimcha (masalan holat Badge'i). */
  titleAddon?: ReactNode;
  /** O'ng tomondagi amallar (tugmalar). */
  actions?: ReactNode;
  /** Sarlavha ustidagi "orqaga" havola. */
  back?: PageHeaderBackLink;
  className?: string;
}

/** Sahifa boshi: ixtiyoriy "← orqaga", `<h1>` sarlavha + tavsif, o'ngda amallar. */
export function PageHeader({
  title,
  description,
  titleAddon,
  actions,
  back,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-2', className)}>
      {back !== undefined ? (
        <TextLink href={back.href} variant="muted" className="self-start text-sm">
          <span aria-hidden="true">← </span>
          {back.label}
        </TextLink>
      ) : null}
      <Stack direction="horizontal" justify="between" align="start" gap="3" wrap>
        <Stack gap="1">
          <Stack direction="horizontal" align="center" gap="3" wrap>
            <Heading as="h1">{title}</Heading>
            {isPresentNode(titleAddon) ? titleAddon : null}
          </Stack>
          {isPresentNode(description) ? <Text variant="muted">{description}</Text> : null}
        </Stack>
        {isPresentNode(actions) ? (
          <Stack direction="horizontal" gap="2" wrap>
            {actions}
          </Stack>
        ) : null}
      </Stack>
    </header>
  );
}
