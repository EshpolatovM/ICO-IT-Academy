import { CsvParseError, detectCsvDelimiter, parseCsv } from './csv-parser.js';

describe('parseCsv', () => {
  it("oddiy qatorlar, CRLF va bo'sh qatorlar", () => {
    expect(parseCsv('a,b\r\n\r\nc,d\n', ',')).toEqual([
      { line: 1, fields: ['a', 'b'] },
      { line: 3, fields: ['c', 'd'] },
    ]);
  });

  it('qo\'shtirnoqli maydon: ajratgich, "" va qator o\'tishi', () => {
    const records = parseCsv('"Ali, aka","O""zbek"\n"ko\'p\nqatorli",x\ny,z', ',');

    expect(records).toEqual([
      { line: 1, fields: ['Ali, aka', 'O"zbek'] },
      { line: 2, fields: ["ko'p\nqatorli", 'x'] },
      { line: 4, fields: ['y', 'z'] },
    ]);
  });

  it("bo'sh maydonlar saqlanadi, faqat bo'shliqli qator o'tkaziladi", () => {
    expect(parseCsv('a,,c\n , \n', ',')).toEqual([{ line: 1, fields: ['a', '', 'c'] }]);
  });

  it('nuqtali vergul ajratgichi', () => {
    expect(parseCsv('a;b', ';')).toEqual([{ line: 1, fields: ['a', 'b'] }]);
  });

  it("yopilmagan qo'shtirnoq — CsvParseError (qator raqami bilan)", () => {
    expect(() => parseCsv('a,b\n"yopilmagan,c', ',')).toThrow(CsvParseError);
    try {
      parseCsv('a,b\n"yopilmagan,c', ',');
    } catch (error) {
      expect((error as CsvParseError).line).toBe(2);
    }
  });
});

describe('detectCsvDelimiter', () => {
  it("sarlavhada faqat ; bo'lsa — ;, aks holda ,", () => {
    expect(detectCsvDelimiter('firstName;lastName\nA;B')).toBe(';');
    expect(detectCsvDelimiter('firstName,lastName')).toBe(',');
    expect(detectCsvDelimiter('firstName,last;Name')).toBe(',');
  });
});
