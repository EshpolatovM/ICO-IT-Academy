import { Badge, Button, PageHeader, Stack, StatCard } from '@/components/ui';

import { PreviewSection } from './PreviewSection';

/** Sahifa qismlari: PageHeader va StatCard. */
export function PageSection() {
  return (
    <PreviewSection
      id="page-parts"
      title="Sahifa qismlari"
      description="PageHeader (orqaga havola, sarlavha yonidagi Badge, tavsif, amallar) va StatCard (oddiy, izohli, yuklanmoqda)."
    >
      <Stack gap="8">
        <PageHeader
          title="Frontend-1"
          titleAddon={<Badge variant="success">Faol</Badge>}
          description="Mentor: Aziz Karimov · 24 student"
          back={{ href: '/design-preview', label: 'Guruhlar' }}
          actions={
            <>
              <Button variant="secondary">Tahrirlash</Button>
              <Button>Student qo&apos;shish</Button>
            </>
          }
        />
        <PageHeader title="Faqat sarlavha" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Studentlar" value={24} />
          <StatCard label="Faol guruhlar" value={6} hint="2 tasi arxivlangan" />
          <StatCard label="O'rtacha XP" value="1 240" hint="Shu hafta" />
          <StatCard label="Mentorlar" value={0} loading />
        </div>
      </Stack>
    </PreviewSection>
  );
}
