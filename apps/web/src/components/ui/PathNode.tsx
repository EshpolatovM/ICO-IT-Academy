import Link from 'next/link';
import { useId } from 'react';

import { cn } from '@/lib/cn';

import { Button } from './Button';
import { focusRing } from './classes';
import { isPresentNode } from './isPresentNode';
import { NodeStatusBadge } from './NodeStatusBadge';

import type { ChestNodeStatus, TopicNodeStatus } from './nodeStatus';
import type { ReactNode } from 'react';

const CHEST_DEFAULT_TITLE = 'Sandiq';
const CHEST_DEFAULT_HINT = "Sandiqni ochish keyinroq qo'shiladi";

interface PathNodeBase {
  title: string;
  /** Joriy pozitsiya: "Siz shu yerdasiz" belgisi va `aria-current="step"`. */
  current?: boolean;
  className?: string;
}

export interface TopicPathNodeProps extends PathNodeBase {
  kind: 'TOPIC';
  status: TopicNodeStatus;
  lessons: number;
  lessonsCompleted: number;
  /** Mavzu sahifasi. LOCKED holatda e'tiborga olinmaydi (havola bo'lmaydi). */
  href?: string;
  /** Qo'shimcha izoh (masalan "Avval takrorlang (2 ta)"). */
  hint?: ReactNode;
}

export interface ChestPathNodeProps extends Omit<PathNodeBase, 'title'> {
  kind: 'CHEST';
  status: ChestNodeStatus;
  title?: string;
  /** Tugma ostidagi tavsif (standart: "keyinroq"). */
  hint?: ReactNode;
}

export type PathNodeProps = TopicPathNodeProps | ChestPathNodeProps;

const rootClasses = 'flex flex-col gap-2 rounded-md border border-border bg-bg p-3';

function CurrentMarker() {
  return <span className="text-xs font-medium text-primary">Siz shu yerdasiz</span>;
}

function TopicTitle({
  title,
  status,
  href,
}: Pick<TopicPathNodeProps, 'title' | 'status' | 'href'>) {
  if (status !== 'LOCKED' && href !== undefined) {
    return (
      <Link
        href={href}
        className={cn('rounded-sm font-medium text-primary hover:underline', focusRing)}
      >
        {title}
      </Link>
    );
  }
  return (
    <span
      role={status === 'LOCKED' ? 'link' : undefined}
      aria-disabled={status === 'LOCKED' ? true : undefined}
      className={cn('font-medium', status === 'LOCKED' ? 'text-text-disabled' : 'text-text')}
    >
      {title}
    </span>
  );
}

function TopicNode(props: TopicPathNodeProps) {
  const {
    title,
    status,
    lessons,
    lessonsCompleted,
    href,
    hint,
    current = false,
    className,
  } = props;
  return (
    <div
      className={cn(rootClasses, current && 'border-primary', className)}
      aria-current={current ? 'step' : undefined}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TopicTitle title={title} status={status} href={href} />
        <NodeStatusBadge kind="TOPIC" status={status} />
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
        <span>
          {lessonsCompleted}/{lessons} dars
        </span>
        {current ? <CurrentMarker /> : null}
      </div>
      {isPresentNode(hint) ? <p className="text-sm text-warning">{hint}</p> : null}
    </div>
  );
}

function ChestNode(props: ChestPathNodeProps) {
  const {
    title = CHEST_DEFAULT_TITLE,
    status,
    hint = CHEST_DEFAULT_HINT,
    current = false,
    className,
  } = props;
  const hintId = useId();
  return (
    <div
      className={cn(rootClasses, 'bg-surface', current && 'border-primary', className)}
      aria-current={current ? 'step' : undefined}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-text">{title}</span>
        <NodeStatusBadge kind="CHEST" status={status} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {/* Ochish 5-modulda: hozircha har doim disabled. */}
        <Button variant="secondary" size="sm" disabled aria-describedby={hintId}>
          Ochish
        </Button>
        <span id={hintId} className="text-xs text-text-muted">
          {hint}
        </span>
        {current ? <CurrentMarker /> : null}
      </div>
    </div>
  );
}

/** Ilm yo'li xaritasidagi bitta tugun: mavzu yoki sandiq. Sof UI, ma'lumot props'dan. */
export function PathNode(props: PathNodeProps) {
  return props.kind === 'TOPIC' ? <TopicNode {...props} /> : <ChestNode {...props} />;
}
