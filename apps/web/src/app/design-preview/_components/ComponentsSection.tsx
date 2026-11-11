import {
  Alert,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Heading,
  Spinner,
  Stack,
  Text,
} from '@/components/ui';
import type { ButtonVariant } from '@/components/ui';

import { PreviewSection } from './PreviewSection';

const BUTTON_VARIANTS: readonly ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];

function ButtonsPreview() {
  return (
    <Stack gap="4">
      <Text variant="muted">
        Hover — sichqonchani olib boring; focus — Tab tugmasi bilan o&apos;ting (ko&apos;k halqa).
      </Text>
      {BUTTON_VARIANTS.map((variant) => (
        <Stack key={variant} direction="horizontal" gap="3" align="center" wrap>
          <Text as="span" variant="small" className="w-24 font-mono">
            {variant}
          </Text>
          <Button variant={variant}>Oddiy</Button>
          <Button variant={variant} size="sm">
            Kichik (sm)
          </Button>
          <Button variant={variant} disabled>
            Disabled
          </Button>
          <Button variant={variant} loading>
            Yuklanmoqda
          </Button>
        </Stack>
      ))}
      <Button fullWidth>To&apos;liq kenglik (fullWidth)</Button>
      <Button asChild variant="secondary">
        <a href="#buttons">Havola tugma ko&apos;rinishida (asChild)</a>
      </Button>
    </Stack>
  );
}

function AlertsPreview() {
  return (
    <Stack gap="3">
      <Alert variant="info" title="Ma'lumot">
        Oddiy axborot xabari.
      </Alert>
      <Alert variant="success" title="Muvaffaqiyat">
        Parol muvaffaqiyatli o&apos;zgartirildi.
      </Alert>
      <Alert variant="warning" title="Ogohlantirish">
        Sessiya tez orada tugaydi.
      </Alert>
      <Alert variant="danger" title="Xato">
        ID yoki parol noto&apos;g&apos;ri.
      </Alert>
    </Stack>
  );
}

function TypographyComponentsPreview() {
  return (
    <Stack gap="2">
      <Heading as="h1">Heading h1</Heading>
      <Heading as="h2">Heading h2</Heading>
      <Heading as="h3">Heading h3</Heading>
      <Heading as="h4">Heading h4</Heading>
      <Text>Text body — oddiy matn.</Text>
      <Text variant="muted">Text muted — yordamchi matn.</Text>
      <Text variant="small">Text small — eng kichik matn.</Text>
      <Text variant="danger">Text danger — xato matni.</Text>
    </Stack>
  );
}

function CardAndSpinnerPreview() {
  return (
    <Stack direction="horizontal" gap="6" align="start" wrap>
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Karta sarlavhasi</CardTitle>
          <Text variant="muted">CardHeader ichidagi tavsif.</Text>
        </CardHeader>
        <CardContent>
          <Text>CardContent — asosiy mazmun.</Text>
        </CardContent>
        <CardFooter>
          <Button size="sm">Saqlash</Button>
          <Button size="sm" variant="ghost">
            Bekor qilish
          </Button>
        </CardFooter>
      </Card>
      <Stack gap="3">
        <Stack direction="horizontal" gap="3" align="center">
          <Spinner size="sm" />
          <Text as="span" variant="small">
            Spinner sm
          </Text>
        </Stack>
        <Stack direction="horizontal" gap="3" align="center">
          <Spinner />
          <Text as="span" variant="small">
            Spinner md
          </Text>
        </Stack>
      </Stack>
    </Stack>
  );
}

/** Tugmalar, xabarlar, tipografiya komponentlari, karta, spinner. */
export function ComponentsSection() {
  return (
    <>
      <PreviewSection id="buttons" title="Button">
        <ButtonsPreview />
      </PreviewSection>
      <PreviewSection id="alerts" title="Alert">
        <AlertsPreview />
      </PreviewSection>
      <PreviewSection id="text" title="Heading va Text">
        <TypographyComponentsPreview />
      </PreviewSection>
      <PreviewSection id="card" title="Card va Spinner">
        <CardAndSpinnerPreview />
      </PreviewSection>
    </>
  );
}
