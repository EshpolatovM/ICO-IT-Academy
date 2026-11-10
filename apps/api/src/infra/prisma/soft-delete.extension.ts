import { Prisma } from './generated/client.js';
import { SOFT_DELETE_FILTERED_OPERATIONS, SOFT_DELETE_MODELS } from './soft-delete.config.js';

const DELETED_AT_FIELD = 'deletedAt';

interface ArgsWithWhere {
  where?: Record<string, unknown>;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Soft delete filtrini qo'llash kerakmi: model ro'yxatda, operatsiya o'qish, va chaqiruvchi
 * `where.deletedAt` ni o'zi ko'rsatmagan bo'lsa. `deletedAt` aniq berilsa (masalan
 * `{ deletedAt: { not: null } }` — faqat o'chirilganlar) — filtr qo'shilmaydi: bu ochiq usul.
 */
export function shouldFilterDeleted(
  model: string | undefined,
  operation: string,
  args: unknown,
): boolean {
  if (model === undefined || !SOFT_DELETE_MODELS.has(model)) {
    return false;
  }
  if (!SOFT_DELETE_FILTERED_OPERATIONS.has(operation)) {
    return false;
  }
  const where = isObject(args) ? args.where : undefined;
  return !(isObject(where) && DELETED_AT_FIELD in where);
}

/** `where` ga `deletedAt: null` qo'shadi (asl argumentlar o'zgartirilmaydi). */
export function withNotDeleted<T extends ArgsWithWhere>(args: T): T {
  return { ...args, where: { ...args.where, [DELETED_AT_FIELD]: null } };
}

/**
 * Prisma client extension: soft delete'li modellarda o'qish so'rovlari o'chirilganlarni
 * ko'rsatmaydi (docs/11 §0). O'chirilganlar bilan ishlash — `PrismaService.dbIncludingDeleted`
 * yoki `where.deletedAt` ni aniq berish.
 * Cheklov: `include`/`select` orqali bog'langan (nested) yozuvlar filtrlanmaydi.
 */
export const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  query: {
    $allModels: {
      $allOperations({ model, operation, args, query }) {
        const filtered = shouldFilterDeleted(model, operation, args)
          ? withNotDeleted(args as ArgsWithWhere)
          : args;
        return query(filtered);
      },
    },
  },
});
