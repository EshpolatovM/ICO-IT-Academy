import { Heading, Markdown, Stack } from '@/components/ui';

import { PreviewSection } from './PreviewSection';

const SAMPLE_SOURCE = `# HTML asoslari

Dars matni **qalin**, *kursiv*, ~~o'chirilgan~~ va \`inline code\` bilan.

## Ro'yxatlar

- Teglar
- Atributlar
  - ichki band

1. Birinchi qadam
2. Ikkinchi qadam

> Eslatma: blockquote oddiy chegarali ko'rinishda.

### Kod bloki

\`\`\`html
<p class="matn">Salom, dunyo!</p>
\`\`\`

### Jadval (GFM)

| Teg | Vazifasi | Yopiladimi |
| :-- | :-- | :-: |
| \`p\` | Paragraf | ha |
| \`img\` | Rasm | yo'q |

---

Havolalar: [MDN (tashqi)](https://developer.mozilla.org) va [pochta](mailto:info@example.com).

https rasm: ![Namuna rasm](https://placehold.co/240x80.png)
`;

const DANGEROUS_SOURCE = `Quyidagilarning hech biri ishlamasligi kerak:

<script>alert('xss')</script>

<b onclick="alert(1)">raw HTML</b>

[javascript: havola](javascript:alert(1)) · [nisbiy havola](/admin)

http rasm (img emas, havola bo'ladi): ![Xavfsiz emas](http://example.com/a.png)

data rasm (oddiy matn): ![data rasm](data:image/png;base64,AAAA)
`;

/** Markdown ko'rinishi: barcha elementlar va xavfli kontent misoli. */
export function MarkdownSection() {
  return (
    <PreviewSection
      id="markdown"
      title="Markdown"
      description="Dars kontenti ko'rinishi: raw HTML yo'q, havolalar http/https/mailto, rasmlar faqat https."
    >
      <Stack gap="6">
        <Markdown source={SAMPLE_SOURCE} />
        <Stack gap="2">
          <Heading as="h3">Xavfli kontent</Heading>
          <Markdown source={DANGEROUS_SOURCE} />
        </Stack>
      </Stack>
    </PreviewSection>
  );
}
