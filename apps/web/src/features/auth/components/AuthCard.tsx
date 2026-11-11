import { Card, CardContent, CardHeader, CardTitle, Text } from '@/components/ui';

import type { ReactNode } from 'react';

export interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Auth sahifalaridagi forma kartasi (sarlavha + izoh + kontent). */
export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description !== undefined ? <Text variant="muted">{description}</Text> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
