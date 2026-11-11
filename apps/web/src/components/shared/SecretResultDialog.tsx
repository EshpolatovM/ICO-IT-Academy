'use client';

import {
  Button,
  DescriptionList,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  SecretReveal,
} from '@/components/ui';
import type { DescriptionItem } from '@/components/ui';

/** Bir marta ko'rsatiladigan maxfiy qiymat (vaqtinchalik parol, ota-ona havolasi yoki kodi). */
export interface SecretItem {
  label: string;
  value: string;
  /** `SecretReveal` ogohlantirishi; berilmasa — standart matn. */
  warning?: string;
}

const TEMPORARY_PASSWORD_LABEL = 'Vaqtinchalik parol';

/** Vaqtinchalik parol → maxfiy qiymatlar ro'yxati (`null` — parolni admin bergan, ko'rsatilmaydi). */
export function temporaryPasswordSecrets(temporaryPassword: string | null): SecretItem[] {
  return temporaryPassword === null
    ? []
    : [{ label: TEMPORARY_PASSWORD_LABEL, value: temporaryPassword }];
}

export interface SecretResultContentProps {
  /** Ochiq ma'lumotlar (ID, telefon, ism, yorliq). */
  items: readonly DescriptionItem[];
  secrets: readonly SecretItem[];
  onDone: () => void;
}

/** Yaratilgan/tiklangan qiymat: ochiq ma'lumotlar + maxfiy qiymatlar (BIR MARTA). */
export function SecretResultContent({ items, secrets, onDone }: SecretResultContentProps) {
  return (
    <>
      <DescriptionList items={items} />
      {secrets.map((secret) => (
        <SecretReveal
          key={secret.label}
          label={secret.label}
          value={secret.value}
          warning={secret.warning}
        />
      ))}
      <DialogFooter>
        <Button onClick={onDone}>Tayyor</Button>
      </DialogFooter>
    </>
  );
}

export interface SecretResultDialogProps extends SecretResultContentProps {
  title: string;
}

/** Maxfiy qiymatni ko'rsatuvchi oyna (yopilganda qiymat xotiradan o'chiriladi — `onDone`). */
export function SecretResultDialog({ title, ...content }: SecretResultDialogProps) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) content.onDone();
      }}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <SecretResultContent {...content} />
      </DialogContent>
    </Dialog>
  );
}
