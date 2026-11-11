import { BaseRepository, SoftDeletableBaseRepository } from './base.repository.js';

import type { RepositoryTypes, SoftDeleteDelegate } from './repository.types.js';

interface Item {
  id: string;
  name: string;
  deletedAt: Date | null;
}

interface ItemTypes extends RepositoryTypes {
  model: Item;
  where: { name?: string };
  create: { id: string; name: string };
  update: Partial<Pick<Item, 'name' | 'deletedAt'>>;
  orderBy: { id: 'asc' | 'desc' };
}

/** Xotiradagi soxta Prisma delegate (test-double). */
class InMemoryDelegate implements SoftDeleteDelegate<ItemTypes> {
  readonly items: Item[] = [];
  lastOrderBy: unknown;

  private matches(where?: ItemTypes['where']) {
    return this.items.filter((item) => where?.name === undefined || item.name === where.name);
  }

  findUnique({ where }: { where: { id: string } }) {
    return Promise.resolve(this.items.find((item) => item.id === where.id) ?? null);
  }

  findMany(args: { where?: ItemTypes['where']; orderBy?: unknown; skip: number; take: number }) {
    this.lastOrderBy = args.orderBy;
    return Promise.resolve(this.matches(args.where).slice(args.skip, args.skip + args.take));
  }

  count({ where }: { where?: ItemTypes['where'] }) {
    return Promise.resolve(this.matches(where).length);
  }

  create({ data }: { data: ItemTypes['create'] }) {
    const item = { ...data, deletedAt: null };
    this.items.push(item);
    return Promise.resolve(item);
  }

  update({ where, data }: { where: { id: string }; data: ItemTypes['update'] }) {
    const item = this.items.find((candidate) => candidate.id === where.id);
    if (!item) {
      return Promise.reject(new Error('not found'));
    }
    Object.assign(item, data);
    return Promise.resolve(item);
  }
}

class ItemRepository extends SoftDeletableBaseRepository<ItemTypes> {
  protected readonly defaultOrderBy = { id: 'asc' } as const;

  constructor(protected readonly delegate: InMemoryDelegate) {
    super();
  }
}

class PlainItemRepository extends BaseRepository<ItemTypes> {
  protected readonly defaultOrderBy = { id: 'desc' } as const;

  constructor(protected readonly delegate: InMemoryDelegate) {
    super();
  }
}

async function seed(repository: BaseRepository<ItemTypes>, count: number): Promise<void> {
  for (let index = 1; index <= count; index += 1) {
    await repository.create({ id: `id-${index}`, name: index % 2 === 0 ? 'even' : 'odd' });
  }
}

describe('BaseRepository', () => {
  let delegate: InMemoryDelegate;
  let repository: ItemRepository;

  beforeEach(() => {
    delegate = new InMemoryDelegate();
    repository = new ItemRepository(delegate);
  });

  it('findById topadi yoki null qaytaradi', async () => {
    await seed(repository, 2);

    expect(await repository.findById('id-2')).toMatchObject({ name: 'even' });
    expect(await repository.findById('yoq')).toBeNull();
  });

  it('findMany — page/pageSize → skip/take, total va tartib', async () => {
    await seed(repository, 5);

    const page = await repository.findMany({ page: 2, pageSize: 2 });

    expect(page).toEqual({
      items: [expect.objectContaining({ id: 'id-3' }), expect.objectContaining({ id: 'id-4' })],
      total: 5,
      page: 2,
      pageSize: 2,
    });
    expect(delegate.lastOrderBy).toEqual({ id: 'asc' });
  });

  it('findMany filtr bilan total ham filtrlangan', async () => {
    await seed(repository, 5);

    const page = await repository.findMany({ page: 1, pageSize: 10 }, { name: 'even' });

    expect(page.total).toBe(2);
    expect(page.items.map((item) => item.id)).toEqual(['id-2', 'id-4']);
  });

  it('update maydonlarni yangilaydi', async () => {
    await seed(repository, 1);

    expect(await repository.update('id-1', { name: 'yangi' })).toMatchObject({ name: 'yangi' });
  });

  it('softDelete deletedAt ni yozadi', async () => {
    await seed(repository, 1);

    const deleted = await repository.softDelete('id-1');

    expect(deleted.deletedAt).toBeInstanceOf(Date);
  });

  it("oddiy BaseRepository o'z defaultOrderBy'sini ishlatadi", async () => {
    const plain = new PlainItemRepository(delegate);

    await plain.findMany({ page: 1, pageSize: 1 });

    expect(delegate.lastOrderBy).toEqual({ id: 'desc' });
  });
});
