import { randomBytes } from 'node:crypto';

import { AuditAction, ErrorCode, Role, STUDENT_IMPORT_FILE_FIELD } from '@lms/shared';
import type { StudentImportResult } from '@lms/shared';

import { AppConfigService } from '../src/common/config/app-config.service.js';
import { PrismaService } from '../src/infra/prisma/prisma.service.js';

import { accessTokenFor, API, http, loginRequest } from './support/auth-fixtures.js';
import { useE2eContext } from './support/e2e-context.js';

/** Excel saqlaydigan UTF-8 BOM. */
const UTF8_BOM = Buffer.from([0xef, 0xbb, 0xbf]);

const LOCK_POLL_MS = 50;
const LOCK_POLL_ATTEMPTS = 100;
const ARCHIVE_TX_TIMEOUT_MS = 15_000;

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/** Import tranzaksiyasi guruh qulfini (`lockManyForUpdate`) kutib turibdimi. */
async function waitForImportLockWaiter(prisma: PrismaService): Promise<void> {
  for (let attempt = 0; attempt < LOCK_POLL_ATTEMPTS; attempt += 1) {
    const [row] = await prisma.dbIncludingDeleted.$queryRaw<[{ waiting: number }]>`
      SELECT count(*)::int AS waiting FROM pg_stat_activity
      WHERE wait_event_type = 'Lock' AND query LIKE '%FROM groups%' AND query LIKE '%uuid[]%'`;
    if (row.waiting > 0) {
      return;
    }
    await delay(LOCK_POLL_MS);
  }
  throw new Error('Import guruh qulfini kutmadi');
}

/**
 * Guruhni qulflab arxivlaydi, lekin `release()` gacha commit qilmaydi: import validatsiyasi guruhni
 * hali faol ko'radi, writer esa qulfda kutadi.
 */
function archiveHoldingLock(prisma: PrismaService, groupId: string) {
  let release: () => void = () => undefined;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  const done = prisma.dbIncludingDeleted.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM groups WHERE id = ${groupId}::uuid FOR UPDATE`;
      await tx.group.update({ where: { id: groupId }, data: { status: 'ARCHIVED' } });
      await released;
    },
    { timeout: ARCHIVE_TX_TIMEOUT_MS },
  );
  return { release, done };
}

/** CSV import (S-21, docs/12 §2): hammasi yoki hech narsa, qator raqamli xatolar, limitlar. */
describe('Studentlar CSV importi (e2e)', () => {
  const context = useE2eContext();
  let adminToken: string;
  const marker = `Imp${randomBytes(4).toString('hex')}`;

  beforeAll(async () => {
    adminToken = await accessTokenFor(context.app, context.fixtures, Role.ADMIN);
  });

  const upload = (content: string | Buffer) =>
    http(context.app)
      .post(`${API}/admin/students/import`)
      .auth(adminToken, { type: 'bearer' })
      .attach(STUDENT_IMPORT_FILE_FIELD, Buffer.from(content), 'students.csv');

  const countByMarker = () =>
    context.app.get(PrismaService).db.user.count({ where: { firstName: { startsWith: marker } } });

  it("to'g'ri fayl: hammasi yaratiladi, guruhga qo'shiladi, parollar bir marta, audit", async () => {
    const group = await context.fixtures.createGroup();
    const csv = [
      'firstName;lastName;groupName',
      `${marker}A;Valiyev;${group.name.toLowerCase()}`,
      `"${marker}B";"O'g'li, Karim";`,
    ].join('\r\n');

    const response = await upload(Buffer.concat([UTF8_BOM, Buffer.from(csv)])).expect(201);
    expect(response.headers['cache-control']).toBe('no-store');
    const result = response.body as StudentImportResult;
    result.students.forEach((student) => {
      context.fixtures.track(student.id);
    });

    expect(result.count).toBe(2);
    expect(result.students[0]).toMatchObject({ firstName: `${marker}A`, groupName: group.name });
    expect(result.students[1]).toMatchObject({ lastName: "O'g'li, Karim", groupName: null });
    const [first] = result.students;
    await loginRequest(
      context.app,
      {
        id: first?.id ?? '',
        role: Role.STUDENT,
        phone: null,
        studentCode: first?.studentCode ?? '',
      },
      first?.temporaryPassword ?? '',
    ).expect(200);
    const members = await context.app
      .get(PrismaService)
      .db.groupMember.count({ where: { groupId: group.id, leftAt: null } });
    expect(members).toBe(1);
    const batch = await context.app.get(PrismaService).db.auditLog.findFirst({
      where: {
        action: AuditAction.STUDENTS_IMPORTED,
        after: { path: ['studentIds'], array_contains: first?.id },
      },
    });
    expect(batch?.after).toMatchObject({ count: 2 });
  });

  it('xato qatorli fayl: 400, qator raqamlari, hech kim yaratilmaydi', async () => {
    const before = await countByMarker();
    const csv = [
      'firstName,lastName,groupName',
      `${marker}C,Ok,`,
      `${marker}D,,`,
      `${marker}E,X,Yoq guruh`,
    ].join('\n');

    const response = await upload(csv).expect(400);

    expect(response.body).toMatchObject({
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        details: [
          { row: 3, field: 'lastName' },
          { row: 4, field: 'groupName' },
        ],
      },
    });
    expect(await countByMarker()).toBe(before);
    const groupError = await upload(
      ['firstName,lastName,groupName', `${marker}E,X,Yoq guruh`].join('\n'),
    ).expect(400);
    expect(groupError.body).toMatchObject({ error: { details: [{ row: 2, field: 'groupName' }] } });
  });

  it('maydon va guruh xatolari bitta javobda (qator tartibida, bitta qatorda ikkalasi ham)', async () => {
    const before = await countByMarker();
    const missingGroup = `YoqGuruh${randomBytes(4).toString('hex')}`;
    const csv = [
      'firstName,lastName,groupName',
      `${marker}F,,`,
      `${marker}G,Aliyev,${missingGroup}`,
      `${marker}H,,${missingGroup}`,
    ].join('\n');

    const response = await upload(csv).expect(400);

    expect(response.body).toMatchObject({
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        details: [
          { row: 2, field: 'lastName' },
          { row: 3, field: 'groupName' },
          { row: 4, field: 'lastName' },
          { row: 4, field: 'groupName' },
        ],
      },
    });
    expect(await countByMarker()).toBe(before);
  });

  it('import paytida guruh arxivlansa — 409 GROUP_ARCHIVED, hech kim yaratilmaydi', async () => {
    const prisma = context.app.get(PrismaService);
    const group = await context.fixtures.createGroup();
    const before = await countByMarker();
    const archive = archiveHoldingLock(prisma, group.id);

    const importing = upload(
      ['firstName,lastName,groupName', `${marker}R,Poyga,${group.name}`].join('\n'),
    ).then((response) => response);
    await waitForImportLockWaiter(prisma);
    archive.release();
    await archive.done;
    const response = await importing;

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: {
        code: ErrorCode.GROUP_ARCHIVED,
        details: { groups: [{ id: group.id, name: group.name }] },
      },
    });
    expect(await countByMarker()).toBe(before);
  });

  it("limitlar: hajmi katta — 413, qatorlar soni — 400, fayl yo'q — 400", async () => {
    const config = context.app.get(AppConfigService);
    const tooLarge = Buffer.alloc(config.get('STUDENT_IMPORT_MAX_FILE_BYTES') + 1, 'a');
    const big = await upload(tooLarge).expect(413);
    expect(big.body).toMatchObject({ error: { code: ErrorCode.PAYLOAD_TOO_LARGE } });

    const rows = Array.from(
      { length: config.get('STUDENT_IMPORT_MAX_ROWS') + 1 },
      (_, index) => `${marker}${String(index)},F`,
    );
    const many = await upload(['firstName,lastName', ...rows].join('\n')).expect(400);
    expect(many.body).toMatchObject({ error: { details: [{ row: 0, field: 'file' }] } });

    await http(context.app)
      .post(`${API}/admin/students/import`)
      .auth(adminToken, { type: 'bearer' })
      .expect(400);
  });
});
