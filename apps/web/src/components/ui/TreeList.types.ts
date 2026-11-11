import type { BadgeVariant } from './Badge';
import type { ReactNode } from 'react';

export interface TreeListStatus {
  label: string;
  variant?: BadgeVariant;
}

export interface TreeListItem {
  id: string;
  /** Qator sarlavhasi; tugmalarning aria-label'ida ham ishlatiladi. */
  title: string;
  /** Sarlavha yonidagi holat Badge'i (DRAFT/PUBLISHED ...). */
  status?: TreeListStatus;
  /** Qator amallari slot'i (Tahrirlash, O'chirish ...). */
  actions?: ReactNode;
  children?: readonly TreeListItem[];
}

/** Tartiblash callback'iga beriladigan joylashuv. */
export interface TreeListMoveContext {
  /** Ota element id'si; eng yuqori daraja uchun `null`. */
  parentId: string | null;
  /** Hozirgi indeks shu ota ichida. */
  index: number;
}

export type TreeListMoveHandler = (item: TreeListItem, context: TreeListMoveContext) => void;

export interface TreeListProps {
  items: readonly TreeListItem[];
  /** Ro'yxatning screen reader nomi ("Yo'l daraxti"). */
  label: string;
  onMoveUp?: TreeListMoveHandler;
  onMoveDown?: TreeListMoveHandler;
  /** Masalan mutatsiya ketayotganda barcha tartiblash tugmalarini bloklash. */
  moveDisabled?: boolean;
  /** Boshlang'ich holatda ichki ro'yxatlar yoyilganmi (standart: ha). */
  defaultExpanded?: boolean;
  className?: string;
}
