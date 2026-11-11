import { shouldFilterDeleted, withNotDeleted } from './soft-delete.extension.js';

describe("soft delete extension mantig'i", () => {
  it.each(['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'])(
    "User.%s da filtr qo'llanadi",
    (operation) => {
      expect(shouldFilterDeleted('User', operation, { where: { role: 'STUDENT' } })).toBe(true);
    },
  );

  it("yozish operatsiyalarida filtr yo'q", () => {
    expect(shouldFilterDeleted('User', 'update', { where: { id: '1' } })).toBe(false);
    expect(shouldFilterDeleted('User', 'create', { data: {} })).toBe(false);
  });

  it("soft delete'siz modelda filtr yo'q", () => {
    expect(shouldFilterDeleted('RefreshToken', 'findMany', {})).toBe(false);
    expect(shouldFilterDeleted(undefined, '$queryRaw', {})).toBe(false);
  });

  it('where.deletedAt aniq berilsa — chaqiruvchi tanlovi hurmat qilinadi (ochiq usul)', () => {
    expect(shouldFilterDeleted('User', 'findMany', { where: { deletedAt: { not: null } } })).toBe(
      false,
    );
  });

  it("argumentsiz chaqiruvda ham filtr qo'llanadi", () => {
    expect(shouldFilterDeleted('User', 'count', undefined)).toBe(true);
  });

  it("withNotDeleted where'ga deletedAt: null qo'shadi va asl obyektni o'zgartirmaydi", () => {
    const args = { where: { role: 'STUDENT' }, take: 5 };

    expect(withNotDeleted(args)).toEqual({
      where: { role: 'STUDENT', deletedAt: null },
      take: 5,
    });
    expect(args.where).toEqual({ role: 'STUDENT' });
    expect(withNotDeleted({})).toEqual({ where: { deletedAt: null } });
  });
});
