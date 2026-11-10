import { Test } from '@nestjs/testing';

import { Role } from '@lms/shared';

import { AppModule } from './app.module.js';
import { STAFF_ROLES } from './common/constants/roles.constants.js';

describe('AppModule (smoke)', () => {
  it('modul xatosiz kompilyatsiya qilinadi', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    expect(moduleRef.get(AppModule)).toBeInstanceOf(AppModule);
    await moduleRef.close();
  });

  it("xodim rollari @lms/shared dagi Role'dan olinadi va student/ota-onani o'z ichiga olmaydi", () => {
    expect(STAFF_ROLES).toEqual([Role.SUPER_ADMIN, Role.ADMIN, Role.MENTOR]);
    expect(STAFF_ROLES).not.toContain(Role.STUDENT);
    expect(STAFF_ROLES).not.toContain(Role.PARENT);
  });
});
