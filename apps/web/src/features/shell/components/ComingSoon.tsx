import { EmptyState, Heading, Stack } from '@/components/ui';

export interface ComingSoonProps {
  title: string;
  description?: string;
}

const DEFAULT_DESCRIPTION = "Bu bo'lim keyingi bosqichlarda qo'shiladi.";

/** Hali qilinmagan sahifa: sarlavha + "Tez orada" bo'sh holati. */
export function ComingSoon({ title, description = DEFAULT_DESCRIPTION }: ComingSoonProps) {
  return (
    <Stack gap="6">
      <Heading as="h1">{title}</Heading>
      <EmptyState title="Tez orada" description={description} />
    </Stack>
  );
}
