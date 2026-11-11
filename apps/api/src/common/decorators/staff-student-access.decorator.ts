import { applyDecorators } from '@nestjs/common';

import { Role } from '@lms/shared';

import { Roles } from './roles.decorator.js';
import { StudentScope } from './student-scope.decorator.js';

/**
 * Xodimning studentga oid amali (docs/12: "SA A M"): SA va A — istalgan student, mentor — faqat
 * o'z ACTIVE guruhining faol a'zosi (`@StudentScope`, aks holda 404). `param` — URL'dagi student id parametri.
 */
export const StaffStudentAccess = (param: string): MethodDecorator & ClassDecorator =>
  applyDecorators(Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MENTOR), StudentScope(param));
