import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/cn';

import { markdownComponents } from './markdownComponents';

export interface MarkdownProps {
  /** Markdown matni (dars kontenti va h.k.). */
  source: string;
  className?: string;
}

const REMARK_PLUGINS = [remarkGfm];

/**
 * Xavfsiz Markdown ko'rinishi (GFM: jadval, ro'yxat, ~~o'chirilgan~~).
 * - Raw HTML ko'rsatilmaydi (`skipHtml`, `rehype-raw` yo'q, `dangerouslySetInnerHTML` yo'q).
 * - Havolalar faqat http/https/mailto, rasmlar faqat https (`@/lib/safeUrl`).
 * - Kod bloklari oddiy `<pre><code>`, syntax highlighting yo'q.
 */
export function Markdown({ source, className }: MarkdownProps) {
  return (
    <div className={cn('flex flex-col gap-4 text-text', className)}>
      <ReactMarkdown skipHtml remarkPlugins={REMARK_PLUGINS} components={markdownComponents}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
