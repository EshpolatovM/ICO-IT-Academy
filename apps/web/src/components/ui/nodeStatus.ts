import type { BadgeVariant } from './Badge';

/** Xarita tuguni turi (docs/05 §1). */
export type PathNodeKind = 'TOPIC' | 'CHEST';

/** Mavzu holatlari (docs/05 §2.1). */
export type TopicNodeStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';

/** Sandiq holatlari (docs/03 §2.1). */
export type ChestNodeStatus = 'LOCKED' | 'READY' | 'OPENED';

interface StatusView {
  /** Ekranda va screen reader'da o'qiladigan nom. */
  label: string;
  /** Oddiy matn belgisi (bezak, `aria-hidden`). */
  symbol: string;
  variant: BadgeVariant;
}

export const TOPIC_STATUS_VIEW: Record<TopicNodeStatus, StatusView> = {
  LOCKED: { label: 'Qulflangan', symbol: '×', variant: 'neutral' },
  AVAILABLE: { label: 'Ochiq', symbol: '○', variant: 'info' },
  IN_PROGRESS: { label: 'Jarayonda', symbol: '◐', variant: 'warning' },
  COMPLETED: { label: 'Tugallangan', symbol: '✓', variant: 'success' },
};

export const CHEST_STATUS_VIEW: Record<ChestNodeStatus, StatusView> = {
  LOCKED: { label: 'Qulflangan', symbol: '×', variant: 'neutral' },
  READY: { label: 'Ochishga tayyor', symbol: '!', variant: 'info' },
  OPENED: { label: 'Ochilgan', symbol: '✓', variant: 'success' },
};
