import { Prisma } from './generated/client.js';

/**
 * Soft delete'li modellar — yagona ro'yxat (docs/11 §0: users, groups, blog).
 * Yangi model `deletedAt` bilan qo'shilganda shu yerga yoziladi.
 */
export const SOFT_DELETE_MODELS: ReadonlySet<string> = new Set<Prisma.ModelName>([
  Prisma.ModelName.User,
  Prisma.ModelName.Group,
]);

/** O'qish operatsiyalari — ularda `deletedAt: null` filtri avtomatik qo'shiladi. */
export const SOFT_DELETE_FILTERED_OPERATIONS: ReadonlySet<string> = new Set([
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
]);
