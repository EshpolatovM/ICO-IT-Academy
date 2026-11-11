/**
 * Kichik RFC 4180 CSV o'quvchi (tashqi kutubxonasiz): `"` bilan o'ralgan maydonlar, ichida
 * ajratgich, qator o'tishi va `""` (qo'shtirnoq) bo'lishi mumkin; `\r\n` va `\n` qator oxiri.
 * Bo'sh qatorlar o'tkazib yuboriladi. Har bir yozuv fayldagi boshlanish qatori raqami bilan
 * qaytadi (1 dan) — xatolarni foydalanuvchiga jadval qatori bo'yicha ko'rsatish uchun.
 */

export const CSV_DELIMITER = { COMMA: ',', SEMICOLON: ';' } as const;
export type CsvDelimiter = (typeof CSV_DELIMITER)[keyof typeof CSV_DELIMITER];

export interface CsvRecord {
  /** Yozuv boshlangan qator raqami (1 dan). */
  line: number;
  fields: string[];
}

export class CsvParseError extends Error {
  override readonly name = 'CsvParseError';

  constructor(
    message: string,
    readonly line: number,
  ) {
    super(message);
  }
}

const QUOTE = '"';
const LINE_FEED = '\n';
const CARRIAGE_RETURN = '\r';
const LINE_BREAK = /\r?\n/;

/**
 * Ajratgich sarlavha qatoridan aniqlanadi: Excel ba'zi lokallarda (uz/ru) `;` bilan saqlaydi.
 * Sarlavhada `;` bor va `,` yo'q bo'lsa — `;`, aks holda `,`.
 */
export function detectCsvDelimiter(text: string): CsvDelimiter {
  const header = text.split(LINE_BREAK, 1)[0] ?? '';
  return header.includes(CSV_DELIMITER.SEMICOLON) && !header.includes(CSV_DELIMITER.COMMA)
    ? CSV_DELIMITER.SEMICOLON
    : CSV_DELIMITER.COMMA;
}

class CsvReader {
  private readonly records: CsvRecord[] = [];
  private fields: string[] = [];
  private field = '';
  private inQuotes = false;
  private index = 0;
  private line = 1;
  private recordLine = 1;

  constructor(
    private readonly text: string,
    private readonly delimiter: CsvDelimiter,
  ) {}

  read(): CsvRecord[] {
    for (; this.index < this.text.length; this.index += 1) {
      const char = this.text.charAt(this.index);
      if (this.inQuotes) {
        this.readQuoted(char);
      } else {
        this.readPlain(char);
      }
    }
    if (this.inQuotes) {
      throw new CsvParseError("Qo'shtirnoq yopilmagan", this.recordLine);
    }
    this.endRecord();
    return this.records;
  }

  private readQuoted(char: string): void {
    if (char !== QUOTE) {
      this.countLine(char);
      this.field += char;
      return;
    }
    if (this.text.charAt(this.index + 1) === QUOTE) {
      this.field += QUOTE;
      this.index += 1;
      return;
    }
    this.inQuotes = false;
  }

  private readPlain(char: string): void {
    if (char === QUOTE && this.field === '') {
      this.inQuotes = true;
    } else if (char === this.delimiter) {
      this.endField();
    } else if (char === LINE_FEED) {
      this.endRecord();
      this.line += 1;
      this.recordLine = this.line;
    } else if (char !== CARRIAGE_RETURN) {
      this.field += char;
    }
  }

  private countLine(char: string): void {
    if (char === LINE_FEED) {
      this.line += 1;
    }
  }

  private endField(): void {
    this.fields.push(this.field);
    this.field = '';
  }

  private endRecord(): void {
    this.endField();
    const isBlank = this.fields.every((value) => value.trim() === '');
    if (!isBlank) {
      this.records.push({ line: this.recordLine, fields: this.fields });
    }
    this.fields = [];
  }
}

/** Matnni yozuvlarga ajratadi; yopilmagan qo'shtirnoqda — `CsvParseError`. */
export function parseCsv(text: string, delimiter: CsvDelimiter): CsvRecord[] {
  return new CsvReader(text, delimiter).read();
}
