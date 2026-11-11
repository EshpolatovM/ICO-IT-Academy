import { z } from 'zod';

import { staffLoginSchema, studentLoginSchema } from '@lms/shared';

import type { LoginFormValues, LoginKind } from '../types/login.types';
import type { HTMLAttributes } from 'react';

export interface LoginFormConfig {
  /** `@lms/shared` login sxemasining maydonlaridan yig'ilgan forma sxemasi. */
  schema: z.ZodType<LoginFormValues, LoginFormValues>;
  /** Server validatsiya xatosidagi (`details[].field`) login maydoni nomi. */
  serverField: string;
  label: string;
  placeholder: string;
  type: 'text' | 'tel';
  autoComplete: string;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
}

/** Login formalari sozlamasi. Validatsiya `@lms/shared` dagi `studentLoginSchema`/`staffLoginSchema` dan. */
export const LOGIN_FORMS: Record<LoginKind, LoginFormConfig> = {
  student: {
    schema: z.object({
      login: studentLoginSchema.shape.studentCode,
      password: studentLoginSchema.shape.password,
    }),
    serverField: 'studentCode',
    label: 'Student ID',
    placeholder: 'ST-10245',
    type: 'text',
    autoComplete: 'username',
  },
  staff: {
    schema: z.object({
      login: staffLoginSchema.shape.phone,
      password: staffLoginSchema.shape.password,
    }),
    serverField: 'phone',
    label: 'Telefon raqam',
    placeholder: '+998901234567',
    type: 'tel',
    autoComplete: 'tel',
    inputMode: 'tel',
  },
};
