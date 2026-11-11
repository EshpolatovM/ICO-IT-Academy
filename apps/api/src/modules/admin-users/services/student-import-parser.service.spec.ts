import { ErrorCode, GROUP_NAME_MAX_LENGTH } from '@lms/shared';

import { StudentImportParser } from './student-import-parser.service.js';

import type { AppConfigService } from '../../../common/config/app-config.service.js';
import type { AppException } from '../../../common/exceptions/app.exception.js';

const MAX_ROWS = 3;
const config = { get: jest.fn(() => MAX_ROWS) } as unknown as AppConfigService;
const parser = new StudentImportParser(config);

function parseAll(text: string | Buffer) {
  return parser.parse(Buffer.isBuffer(text) ? text : Buffer.from(text, 'utf8'));
}

function parse(text: string | Buffer) {
  return parseAll(text).rows;
}

function detailsOf(text: string | Buffer): unknown {
  try {
    parse(text);
  } catch (error) {
    const exception = error as AppException;
    expect(exception.code).toBe(ErrorCode.VALIDATION_ERROR);
    return exception.details;
  }
  throw new Error('Xato kutilgan edi');
}

describe('StudentImportParser', () => {
  it("sarlavha bo'yicha ustunlar (tartib/registr ixtiyoriy), BOM, trim, bo'sh guruh", () => {
    const rows = parse('﻿LastName,FIRSTNAME,groupname\r\n Valiyev , Ali ,FE-12\nKarimova,Laylo,\n');

    expect(rows).toEqual([
      { line: 2, firstName: 'Ali', lastName: 'Valiyev', groupName: 'FE-12' },
      { line: 3, firstName: 'Laylo', lastName: 'Karimova', groupName: undefined },
    ]);
  });

  it('nuqtali vergul va guruh ustunisiz fayl', () => {
    expect(parse('firstName;lastName\nAli;Valiyev')).toEqual([
      { line: 2, firstName: 'Ali', lastName: 'Valiyev', groupName: undefined },
    ]);
  });

  it("qator xatolari — exception emas, barchasi qator raqamlari bilan to'planadi", () => {
    const longName = 'x'.repeat(65);

    expect(parseAll(`firstName,lastName\nAli,\n${longName},V\nA,B,C`)).toEqual({
      rows: [],
      errors: [
        { row: 2, field: 'lastName', message: expect.any(String) as string },
        { row: 3, field: 'firstName', message: expect.any(String) as string },
        { row: 4, field: 'file', message: "Ustunlar soni sarlavhadagidan ko'p" },
      ],
      rejectedGroups: [],
    });
  });

  it("to'g'ri qatorlar xatolilar bilan birga qaytadi (guruh tekshiruvi uchun)", () => {
    expect(parseAll('firstName,lastName,groupName\nVali,,\nSardor,Aliyev,YoqGuruh123')).toEqual({
      rows: [{ line: 3, firstName: 'Sardor', lastName: 'Aliyev', groupName: 'YoqGuruh123' }],
      errors: [{ row: 2, field: 'lastName', message: expect.any(String) as string }],
      rejectedGroups: [],
    });
  });

  it("rad etilgan qatorning to'g'ri guruh nomi ham qaytadi (guruh xatosi ham chiqishi uchun)", () => {
    const longGroup = 'g'.repeat(GROUP_NAME_MAX_LENGTH + 1);
    const result = parseAll(
      `firstName,lastName,groupName\nVali,, FE-12 \n,Aliyev,${longGroup}\nA,B,C,D`,
    );

    expect(result.rows).toEqual([]);
    expect(result.rejectedGroups).toEqual([{ line: 2, groupName: 'FE-12' }]);
    expect(result.errors.map(({ row, field }) => ({ row, field }))).toEqual([
      { row: 2, field: 'lastName' },
      { row: 3, field: 'firstName' },
      { row: 3, field: 'groupName' },
      { row: 4, field: 'file' },
    ]);
  });

  it("sarlavha xatolari: noma'lum, takroriy, majburiy ustun yo'q", () => {
    expect(detailsOf('firstName,firstName,email\nA,B,C')).toEqual([
      { row: 1, field: 'firstName', message: 'Ustun takrorlangan' },
      { row: 1, field: 'email', message: "Noma'lum ustun" },
      { row: 1, field: 'lastName', message: "Majburiy ustun yo'q" },
    ]);
  });

  it.each([
    ['', "Fayl bo'sh"],
    ['firstName,lastName\n', "ma'lumot qatorlari yo'q"],
    ['firstName,lastName\nA,B\nC,D\nE,F\nG,H', `${String(MAX_ROWS)} ta`],
    ['firstName,lastName\n"A,B', "Qo'shtirnoq"],
  ])('fayl darajasidagi xato: %j', (text, message) => {
    expect(detailsOf(text)).toEqual([
      expect.objectContaining({
        field: 'file',
        message: expect.stringContaining(message) as string,
      }),
    ]);
  });

  it("UTF-8 bo'lmagan fayl — xato", () => {
    expect(detailsOf(Buffer.from([0xff, 0xfe, 0x00, 0x41]))).toEqual([
      expect.objectContaining({ row: 0, field: 'file' }),
    ]);
  });
});
