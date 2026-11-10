import { FormField, Input, Label, PasswordInput, Stack } from '@/components/ui';

import { PreviewSection } from './PreviewSection';

function InputStates() {
  return (
    <Stack gap="4">
      <Stack gap="1">
        <Label htmlFor="preview-input-default">Oddiy (Input + Label)</Label>
        <Input id="preview-input-default" placeholder="Matn kiriting" />
      </Stack>
      <Stack gap="1">
        <Label htmlFor="preview-input-disabled">Disabled</Label>
        <Input id="preview-input-disabled" placeholder="Bloklangan" disabled />
      </Stack>
      <Stack gap="1">
        <Label htmlFor="preview-input-invalid">Xato holati</Label>
        <Input id="preview-input-invalid" defaultValue="noto'g'ri qiymat" invalid />
      </Stack>
      <Stack gap="1">
        <Label htmlFor="preview-input-password">PasswordInput</Label>
        <PasswordInput id="preview-input-password" defaultValue="maxfiy123" />
      </Stack>
    </Stack>
  );
}

function FormFieldStates() {
  return (
    <Stack gap="4">
      <FormField label="Telefon raqam" hint="Masalan: +998 90 123 45 67" required>
        {(control) => <Input type="tel" autoComplete="tel" {...control} />}
      </FormField>
      <FormField label="Student ID" error="ID yoki parol noto'g'ri" required>
        {(control) => <Input defaultValue="ST-10245" {...control} />}
      </FormField>
      <FormField label="Parol" hint="Kamida 8 belgi">
        {(control) => <PasswordInput autoComplete="current-password" {...control} />}
      </FormField>
      <FormField label="Disabled maydon">{(control) => <Input disabled {...control} />}</FormField>
    </Stack>
  );
}

/** Forma elementlari: Input, PasswordInput, Label, FormField — barcha holatlar. */
export function FormsSection() {
  return (
    <PreviewSection
      id="forms"
      title="Forma elementlari"
      description="Oddiy, focus (Tab), disabled va xato holatlari."
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <InputStates />
        <FormFieldStates />
      </div>
    </PreviewSection>
  );
}
