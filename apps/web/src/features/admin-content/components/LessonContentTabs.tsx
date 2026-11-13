'use client';

import {
  FormField,
  Markdown,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Textarea,
} from '@/components/ui';

import type { UseFormRegisterReturn } from 'react-hook-form';

/** Dars matni maydonining balandligi (qatorlar). */
const CONTENT_ROWS = 20;

export interface LessonContentTabsProps {
  registration: UseFormRegisterReturn;
  /** Joriy matn (preview uchun, `form.watch`). */
  source: string;
  error?: string;
}

/** Dars matni: "Matn" (Markdown textarea) va "Ko'rinish" (`<Markdown />` — xavfsiz preview). */
export function LessonContentTabs({ registration, source, error }: LessonContentTabsProps) {
  return (
    <Tabs defaultValue="edit">
      <TabsList aria-label="Dars matni">
        <TabsTrigger value="edit">Matn</TabsTrigger>
        <TabsTrigger value="preview">Ko&apos;rinish</TabsTrigger>
      </TabsList>
      <TabsContent value="edit">
        <FormField label="Matn (Markdown)" error={error}>
          {({ invalid, required: _required, ...control }) => (
            <Textarea {...control} rows={CONTENT_ROWS} invalid={invalid} {...registration} />
          )}
        </FormField>
      </TabsContent>
      <TabsContent value="preview">
        {source.trim() === '' ? (
          <Text variant="muted">Matn hali bo&apos;sh.</Text>
        ) : (
          <Markdown source={source} />
        )}
      </TabsContent>
    </Tabs>
  );
}
