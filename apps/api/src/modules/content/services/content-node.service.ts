import { AuditAction } from '@lms/shared';
import type { AuditEntityType, ContentStatus } from '@lms/shared';

import { ForeignKeyViolationError } from '../../../common/exceptions/constraint-violation.error.js';
import { hasProgressException, orNotFound } from '../content.errors.js';

import { diffChanges, isEmptyDiff } from './content-changes.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { ContentNodeRecord } from '../content.types.js';
import type { ContentEntity } from './content-auditor.service.js';
import type { ContentKit } from './content-kit.service.js';
import type { ProgressScope } from '../repositories/content-progress.repository.js';
import type { ContentNodeStore } from '../repositories/ordered-content.repository.js';

/**
 * Bo'lim, mavzu va dars uchun umumiy shablon (3.2 §3.3): yaratish (oxiriga, ota qulfi ostida,
 * `DRAFT`), PATCH (qulflangan qatordan diff; no-op — audit va versiya yo'q; holat — alohida audit),
 * o'chirish (progress bo'lsa — 409 `HAS_PROGRESS`, poygadagi FK xatosi ham shunday). Har bir
 * mutatsiya commit'dan keyin yo'l versiyasini oshiradi.
 */
export abstract class ContentNodeService<
  TRecord extends ContentNodeRecord,
  TCreate,
  TFields extends { title: string },
  TChanges extends Partial<TRecord> & { status?: ContentStatus },
  TNode,
> {
  protected abstract readonly entityType: AuditEntityType;
  protected abstract readonly progressScope: ProgressScope;

  protected constructor(
    protected readonly store: ContentNodeStore<TRecord, TFields, TChanges>,
    protected readonly kit: ContentKit,
  ) {}

  /** Javob shakli (bo'lim/mavzu — bolalari bilan, dars — to'liq). Yo'q — 404. */
  protected abstract loadNode(id: string): Promise<TNode>;

  /** So'rovdan yangi yozuv maydonlari (ixtiyoriylar — `null`/standart). */
  protected abstract toFields(request: TCreate): TFields;

  /** O'chirishdan oldingi qo'shimcha tekshiruv (mavzu: sandiq bog'langan). */
  protected beforeDelete(_record: TRecord): Promise<void> {
    return Promise.resolve();
  }

  async create(parentId: string, request: TCreate, actor: ActorContext): Promise<TNode> {
    const fields = this.toFields(request);
    const id = await this.kit.transaction.commit(async () => {
      const pathId = orNotFound(await this.store.lockParent(parentId));
      const order = await this.store.nextOrder(parentId);
      const created = await this.store.createNode({ parentId, order, fields });
      await this.kit.auditor.record(AuditAction.CONTENT_CREATED, this.entity(created.id), actor, {
        after: { title: fields.title, parentId },
      });
      return { result: created.id, changedPathIds: [pathId] };
    });
    return this.loadNode(id);
  }

  async update(id: string, request: TChanges, actor: ActorContext): Promise<TNode> {
    await this.kit.transaction.commit(async () => {
      const current = orNotFound(await this.store.lockRecord(id));
      const diff = diffChanges(current, request);
      if (isEmptyDiff(diff)) {
        return { result: undefined, changedPathIds: [] };
      }
      await this.store.applyChanges(id, diff as TChanges);
      await this.kit.auditor.recordPatch(this.entity(id), actor, current, diff);
      return { result: undefined, changedPathIds: [current.pathId] };
    });
    return this.loadNode(id);
  }

  async remove(id: string, actor: ActorContext): Promise<void> {
    try {
      await this.kit.transaction.commit(async () => {
        const current = await this.lockForDelete(id);
        if (await this.kit.progress.hasProgress(this.progressScope, id)) {
          throw hasProgressException();
        }
        await this.beforeDelete(current);
        await this.store.deleteById(id);
        await this.kit.auditor.record(AuditAction.CONTENT_DELETED, this.entity(id), actor, {
          before: { title: current.title, parentId: current.parentId },
        });
        return { result: undefined, changedPathIds: [current.pathId] };
      });
    } catch (error) {
      throw error instanceof ForeignKeyViolationError ? hasProgressException() : error;
    }
  }

  /**
   * Qulf tartibi ota → bola (yaratish va qayta tartiblash bilan bir xil): parallel tartiblash
   * o'chirilayotgan bolani "yo'qotib qo'ymaydi" va deadlock bo'lmaydi. Yo'q — 404.
   */
  private async lockForDelete(id: string): Promise<TRecord> {
    const { parentId } = orNotFound(await this.store.findRecord(id));
    orNotFound(await this.store.lockParent(parentId));
    return orNotFound(await this.store.lockRecord(id));
  }

  protected entity(id: string): ContentEntity {
    return { type: this.entityType, id };
  }
}
