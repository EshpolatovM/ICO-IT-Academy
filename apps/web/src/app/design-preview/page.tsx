import { notFound } from 'next/navigation';

import { Container, Heading, Stack, Text } from '@/components/ui';

import { ColorsSection } from './_components/ColorsSection';
import { ComponentsSection } from './_components/ComponentsSection';
import { DataSection } from './_components/DataSection';
import { FieldsExtraSection } from './_components/FieldsExtraSection';
import { FormsSection } from './_components/FormsSection';
import { LayoutSection } from './_components/LayoutSection';
import { LearningPathSection } from './_components/LearningPathSection';
import { MarkdownSection } from './_components/MarkdownSection';
import { OverlaySection } from './_components/OverlaySection';
import { PageSection } from './_components/PageSection';
import { ScalesSection } from './_components/ScalesSection';
import { SelectionSection } from './_components/SelectionSection';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design preview — ICO IT Academy',
  robots: { index: false, follow: false },
};

/**
 * Sahifa faqat dev va staging uchun. Production build'da (`NODE_ENV=production`) yopiq (404),
 * agar staging build'da `ENABLE_DESIGN_PREVIEW=true` berilmagan bo'lsa.
 * Tekshiruv build vaqtida bajariladi — sahifa statik 404 sifatida prerender qilinadi.
 */
function isDesignPreviewEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.ENABLE_DESIGN_PREVIEW === 'true';
}

export default function DesignPreviewPage() {
  if (!isDesignPreviewEnabled()) {
    notFound();
  }

  return (
    <main>
      <Container size="xl" className="py-8">
        <Stack gap="8">
          <Stack gap="2">
            <Heading as="h1">Design preview</Heading>
            <Text variant="muted">
              Wireframe token&apos;lari va asosiy UI komponentlar. Hozircha faqat yorug&apos; tema.
            </Text>
          </Stack>
          <ColorsSection />
          <ScalesSection />
          <ComponentsSection />
          <FormsSection />
          <FieldsExtraSection />
          <SelectionSection />
          <DataSection />
          <OverlaySection />
          <PageSection />
          <LearningPathSection />
          <MarkdownSection />
          <LayoutSection />
        </Stack>
      </Container>
    </main>
  );
}
