import {
  AppShell,
  Button,
  Container,
  EmptyState,
  NavItem,
  Sidebar,
  Stack,
  Text,
  TextLink,
  TopBar,
} from '@/components/ui';

import { PreviewSection } from './PreviewSection';

function ShellPreview() {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <AppShell
        className="min-h-0"
        topBar={
          <TopBar
            start={<Text as="span">ICO IT Academy</Text>}
            end={
              <Button size="sm" variant="ghost">
                Chiqish
              </Button>
            }
          />
        }
        sidebar={
          <Sidebar>
            <NavItem href="/design-preview#layout" active>
              Aktiv bo&apos;lim
            </NavItem>
            <NavItem href="/design-preview#layout">Oddiy bo&apos;lim</NavItem>
            <NavItem href="/design-preview#layout" hint="3">
              Izohli bo&apos;lim (hint)
            </NavItem>
            <NavItem disabled hint="Tez orada">
              Bosilmaydigan (disabled)
            </NavItem>
          </Sidebar>
        }
      >
        <EmptyState
          title="Hozircha bo'sh"
          description="Bu bo'lim keyingi modullarda to'ldiriladi."
          action={<Button size="sm">Amal</Button>}
        />
      </AppShell>
    </div>
  );
}

function MobileMenuNote() {
  return (
    <Text variant="muted">
      Mobil menyu: brauzer oynasini <code className="font-mono">md</code> (768px) dan toraytiring —
      yon panel yashirinadi, yuqori panelda &quot;Menyu&quot; tugmasi chiqadi. Panel kontent ustida
      ochiladi; Esc yoki havola bosilganda yopiladi, ochiq paytda Tab fokusni panel ichida
      aylantiradi.
    </Text>
  );
}

function TextLinkPreview() {
  return (
    <Stack gap="2">
      <Text>
        Matn ichida <TextLink href="/design-preview#layout">oddiy havola (default)</TextLink> va{' '}
        <TextLink href="/design-preview#layout" variant="muted">
          xira havola (muted)
        </TextLink>
        .
      </Text>
      <Text>
        Tashqi havola:{' '}
        <TextLink href="https://nextjs.org" external>
          nextjs.org (yangi oynada)
        </TextLink>
      </Text>
    </Stack>
  );
}

function StackPreview() {
  return (
    <Container size="md" className="px-0">
      <Stack gap="3">
        <Text variant="muted">Stack vertical, gap 2:</Text>
        <Stack gap="2">
          <span className="rounded-sm bg-surface-muted p-2 text-sm">1</span>
          <span className="rounded-sm bg-surface-muted p-2 text-sm">2</span>
        </Stack>
        <Text variant="muted">Stack horizontal, gap 4, justify between:</Text>
        <Stack direction="horizontal" gap="4" justify="between">
          <span className="rounded-sm bg-surface-muted p-2 text-sm">Chap</span>
          <span className="rounded-sm bg-surface-muted p-2 text-sm">O&apos;ng</span>
        </Stack>
      </Stack>
    </Container>
  );
}

/** Layout karkasi: AppShell (mobil menyu), TopBar, Sidebar/NavItem, TextLink, EmptyState, Container, Stack. */
export function LayoutSection() {
  return (
    <PreviewSection
      id="layout"
      title="Layout"
      description="Rol panellari uchun bo'sh karkas: TopBar + Sidebar + kontent, mobil menyu va havolalar."
    >
      <Stack gap="6">
        <ShellPreview />
        <MobileMenuNote />
        <TextLinkPreview />
        <StackPreview />
      </Stack>
    </PreviewSection>
  );
}
