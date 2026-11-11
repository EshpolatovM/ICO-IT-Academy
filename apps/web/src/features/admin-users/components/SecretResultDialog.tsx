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

export interface SecretResultContentProps {
  /** Akkaunt ma'lumotlari (ID, telefon, ism). */
  items: readonly DescriptionItem[];
  /** `null` — parolni admin bergan (vaqtinchalik parol yo'q). */
  temporaryPassword: string | null;
  onDone: () => void;
}

/** Yaratilgan/tiklangan akkaunt: login ma'lumotlari + vaqtinchalik parol (BIR MARTA). */
export function SecretResultContent({
  items,
  temporaryPassword,
  onDone,
}: SecretResultContentProps) {
  return (
    <>
      <DescriptionList items={items} />
      {temporaryPassword !== null ? (
        <SecretReveal label="Vaqtinchalik parol" value={temporaryPassword} />
      ) : null}
      <DialogFooter>
        <Button onClick={onDone}>Tayyor</Button>
      </DialogFooter>
    </>
  );
}

export interface SecretResultDialogProps extends SecretResultContentProps {
  title: string;
}

/** Vaqtinchalik parolni ko'rsatuvchi oyna (yopilganda qiymat xotiradan o'chiriladi — `onDone`). */
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
