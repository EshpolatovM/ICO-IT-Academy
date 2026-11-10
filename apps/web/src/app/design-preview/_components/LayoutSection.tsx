import {
  AppShell,
  Button,
  Container,
  EmptyState,
  NavItem,
  Sidebar,
  Stack,
  Text,
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
            <NavItem href="/design-preview#layout">Yana bir bo&apos;lim</NavItem>
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

/** Layout karkasi: AppShell, TopBar, Sidebar/NavItem, EmptyState, Container, Stack. */
export function LayoutSection() {
  return (
    <PreviewSection
      id="layout"
      title="Layout"
      description="Rol panellari uchun bo'sh karkas: TopBar + Sidebar + kontent."
    >
      <Stack gap="6">
        <ShellPreview />
        <StackPreview />
      </Stack>
    </PreviewSection>
  );
}
