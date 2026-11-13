import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Markdown } from './Markdown';

function renderMarkdown(source: string) {
  return render(<Markdown source={source} />);
}

describe('Markdown: XSS himoyasi', () => {
  it('<script> va raw HTML DOMga tushmaydi', () => {
    const { container } = renderMarkdown(
      'Salom\n\n<script>alert(1)</script>\n\n<div class="x" onclick="alert(1)">blok</div>\n\nmatn <b>qalin</b> <img src="https://e.com/a.png" onerror="alert(1)">',
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('div.x')).toBeNull();
    expect(container.querySelector('b')).toBeNull();
    expect(container.querySelector('[onerror]')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.innerHTML).not.toContain('alert(1)');
    expect(screen.getByText('Salom')).toBeInTheDocument();
  });

  it.each([
    'javascript:alert(1)',
    'JAVASCRIPT:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
  ])("xavfli link (%s) oddiy matn bo'ladi", (href) => {
    renderMarkdown(`[bosing](${href})`);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('bosing')).toBeInTheDocument();
  });

  it("nisbiy link ham oddiy matn bo'ladi", () => {
    renderMarkdown('[ichki](/admin)');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it("http: rasm <img> bo'lmaydi, alt matnli havola bo'ladi", () => {
    renderMarkdown('![Sxema](http://example.com/a.png)');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sxema' })).toHaveAttribute(
      'href',
      'http://example.com/a.png',
    );
  });

  it("javascript: rasm oddiy alt matn bo'ladi", () => {
    renderMarkdown('![Rasm nomi](javascript:alert(1))');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Rasm nomi')).toBeInTheDocument();
  });
});

describe('Markdown: kontent', () => {
  it("https: rasm alt bilan ko'rinadi", () => {
    renderMarkdown('![Logotip](https://example.com/logo.png)');
    const image = screen.getByRole('img', { name: 'Logotip' });
    expect(image).toHaveAttribute('src', 'https://example.com/logo.png');
    expect(image).toHaveAttribute('referrerpolicy', 'no-referrer');
  });

  it('tashqi link yangi oynada, rel="noopener noreferrer" bilan', () => {
    renderMarkdown('[MDN](https://developer.mozilla.org)');
    const link = screen.getByRole('link', { name: 'MDN' });
    expect(link).toHaveAttribute('href', 'https://developer.mozilla.org/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('mailto link yangi oynasiz', () => {
    renderMarkdown('[Yozing](mailto:info@example.com)');
    const link = screen.getByRole('link', { name: 'Yozing' });
    expect(link).toHaveAttribute('href', 'mailto:info@example.com');
    expect(link).not.toHaveAttribute('target');
  });

  it('GFM jadval', () => {
    renderMarkdown('| Teg | Vazifa |\n| :-- | --: |\n| `p` | Paragraf |');
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Teg' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Paragraf' })).toHaveClass('text-right');
  });

  it('kod bloki <pre><code> ichida, inline code alohida', () => {
    const { container } = renderMarkdown('Matn `let x` bor.\n\n```js\nconst a = 1;\n```');
    const block = container.querySelector('pre > code');
    expect(block).not.toBeNull();
    expect(block?.textContent).toBe('const a = 1;\n');
    expect(screen.getByText('let x').tagName).toBe('CODE');
  });

  it("sarlavha va ro'yxatlar", () => {
    renderMarkdown('## Mavzu\n\n- bir\n- ikki\n\n1. birinchi');
    expect(screen.getByRole('heading', { level: 2, name: 'Mavzu' })).toBeInTheDocument();
    expect(screen.getAllByRole('list')).toHaveLength(2);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});
