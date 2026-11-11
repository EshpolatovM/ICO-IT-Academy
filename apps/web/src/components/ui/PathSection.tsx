import { useId } from 'react';

import { cn } from '@/lib/cn';

import { Heading } from './Heading';
import { PathNode } from './PathNode';
import { ProgressBar } from './ProgressBar';

import type { HeadingLevel } from './Heading';
import type { PathNodeProps } from './PathNode';

export type PathSectionNode = PathNodeProps & {
  /** React kaliti uchun barqaror id (mavzu yoki sandiq id'si). */
  id: string;
};

export interface PathSectionProps {
  title: string;
  /** Bo'lim progressi, 0–1. Berilmasa progress chizig'i chiqmaydi. */
  progress?: number;
  nodes: readonly PathSectionNode[];
  /** Sarlavha darajasi (standart: h2). */
  headingAs?: HeadingLevel;
  className?: string;
}

/** Xaritadagi bo'lim: sarlavha, progress va tugunlarning vertikal zanjiri (`ol`/`li`). */
export function PathSection({
  title,
  progress,
  nodes,
  headingAs = 'h2',
  className,
}: PathSectionProps) {
  const headingId = useId();
  return (
    <section className={cn('flex flex-col gap-4', className)} aria-labelledby={headingId}>
      <Heading as={headingAs} id={headingId}>
        {title}
      </Heading>
      {progress !== undefined ? <ProgressBar value={progress} label="Bo'lim progressi" /> : null}
      <ol className="ml-2 flex flex-col gap-3 border-l-2 border-border pl-4">
        {nodes.map(({ id, ...node }) => (
          <li key={id}>
            <PathNode {...node} />
          </li>
        ))}
      </ol>
    </section>
  );
}
