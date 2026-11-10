import { Card, CardContent, CardHeader, CardTitle, Text } from '@/components/ui';

import type { ReactNode } from 'react';

interface PreviewSectionProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

/** /design-preview bo'limi uchun umumiy karta. */
export function PreviewSection({ id, title, description, children }: PreviewSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`}>
      <Card>
        <CardHeader>
          <CardTitle id={`${id}-title`}>{title}</CardTitle>
          {description !== undefined ? <Text variant="muted">{description}</Text> : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}
