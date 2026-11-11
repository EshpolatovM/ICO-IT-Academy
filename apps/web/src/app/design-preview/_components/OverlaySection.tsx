'use client';

import { useState } from 'react';

import {
  Button,
  ConfirmDialog,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormField,
  Input,
  SecretReveal,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from '@/components/ui';

import { PreviewSection } from './PreviewSection';

/** Preview'da "so'rov" davomiyligi (ConfirmDialog loading holatini ko'rsatish uchun). */
const FAKE_REQUEST_MS = 1500;

function DialogPreview() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Dialog ochish</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Student yaratish</DialogTitle>
          <DialogDescription>Fokus oyna ichida aylanadi, Esc bilan yopiladi.</DialogDescription>
        </DialogHeader>
        <FormField label="Ism">{(control) => <Input {...control} />}</FormField>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Bekor qilish</Button>
          </DialogClose>
          <Button>Saqlash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmPreview() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Button
        variant="danger"
        onClick={() => {
          setOpen(true);
        }}
      >
        Deaktivatsiya (ConfirmDialog)
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Studentni deaktivatsiya qilish"
        description="Student tizimga kira olmaydi. Keyin qayta faollashtirish mumkin."
        confirmLabel="Deaktivatsiya"
        variant="danger"
        loading={loading}
        onConfirm={() => {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            setOpen(false);
          }, FAKE_REQUEST_MS);
        }}
      />
    </>
  );
}

function TabsPreview() {
  return (
    <Tabs defaultValue="progress">
      <TabsList aria-label="Student profili (namuna)">
        <TabsTrigger value="progress">Progress</TabsTrigger>
        <TabsTrigger value="tokens">Ota-ona tokenlari</TabsTrigger>
        <TabsTrigger value="chat" disabled>
          Chat (disabled)
        </TabsTrigger>
      </TabsList>
      <TabsContent value="progress">
        <Text variant="muted">Strelkalar bilan tablar orasida yuring (roving tabindex).</Text>
      </TabsContent>
      <TabsContent value="tokens">
        <Text variant="muted">Ota-ona tokenlari ro&apos;yxati shu yerda.</Text>
      </TabsContent>
    </Tabs>
  );
}

/** Dialog, ConfirmDialog, Tabs, SecretReveal. */
export function OverlaySection() {
  return (
    <>
      <PreviewSection id="dialog" title="Dialog va ConfirmDialog">
        <Stack direction="horizontal" gap="3" wrap>
          <DialogPreview />
          <ConfirmPreview />
        </Stack>
      </PreviewSection>
      <PreviewSection id="tabs" title="Tabs">
        <TabsPreview />
      </PreviewSection>
      <PreviewSection
        id="secret"
        title="SecretReveal"
        description="Vaqtinchalik parol yoki ota-ona havolasini bir marta ko'rsatish."
      >
        <Stack gap="6">
          <SecretReveal label="Vaqtinchalik parol" value="Xk7-pQ2m-Lz9w" />
          <SecretReveal
            label="Ota-ona havolasi"
            value="https://lms.example.test/parent#t=3f9a1c7e5b2d4a6f8e0c1b3d5f7a9c2e4b6d8f0a"
          />
        </Stack>
      </PreviewSection>
    </>
  );
}
