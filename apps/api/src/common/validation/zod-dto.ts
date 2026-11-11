import { ZodType } from 'zod';

import type { z } from 'zod';

const ZOD_SCHEMA_METADATA = Symbol('ZOD_SCHEMA_METADATA');

/** zod sxemasiga bog'langan DTO class (instansiya tipi sxema natijasidan). */
export type ZodDtoClass<TSchema extends ZodType = ZodType> = new () => z.output<TSchema>;

/** DTO class'ga sxemani metadata sifatida bog'laydi (merosxo'r class'larga ham o'tadi). */
function ZodSchema(schema: ZodType): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(ZOD_SCHEMA_METADATA, schema, target);
  };
}

/**
 * `@lms/shared` dagi zod sxemadan DTO class yasaydi (CLAUDE.md: "Validatsiya DTO orqali"):
 *
 *   export class LoginDto extends createZodDto(loginSchema) {}
 *
 * Tip sxemadan chiqariladi — front va back bitta sxemadan foydalanadi.
 */
export function createZodDto<TSchema extends ZodType>(schema: TSchema): ZodDtoClass<TSchema> {
  @ZodSchema(schema)
  class ZodDto {}
  return ZodDto as ZodDtoClass<TSchema>;
}

/** Parametr tipi zod DTO bo'lsa — uning sxemasi, aks holda `undefined`. */
export function getZodSchema(metatype: unknown): ZodType | undefined {
  if (typeof metatype !== 'function') {
    return undefined;
  }
  const schema: unknown = Reflect.getMetadata(ZOD_SCHEMA_METADATA, metatype);
  return schema instanceof ZodType ? schema : undefined;
}
