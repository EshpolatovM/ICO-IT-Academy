import { ErrorCode } from '@lms/shared';

import { StudentImportParser } from './student-import-parser.service.js';

import type { AppConfigService } from '../../../common/config/app-config.service.js';
import type { AppException } from '../../../common/exceptions/app.exception.js';

const MAX_ROWS = 3;
const config = { get: jest.fn(() => MAX_ROWS) } as unknown as AppConfigService;
const parser = new StudentImportParser(config);

function parse(text: string | Buffer) {
  return parser.parse(Buffer.isBuffer(text) ? text : Buffer.from(text, 'utf8'));
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

  it('qator xatolari — barchasi qator raqamlari bilan', () => {
    const longName = 'x'.repeat(65);

    expect(detailsOf(`firstName,lastName\nAli,\n${longName},V\nA,B,C`)).toEqual([
      { row: 2, field: 'lastName', message: expect.any(String) as string },
      { row: 3, field: 'firstName', message: expect.any(String) as string },
      { row: 4, field: 'file', message: "Ustunlar soni sarlavhadagidan ko'p" },
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
