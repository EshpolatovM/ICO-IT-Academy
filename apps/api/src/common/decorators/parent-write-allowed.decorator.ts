import { SetMetadata } from '@nestjs/common';

export const PARENT_WRITE_ALLOWED_KEY = 'auth:parentWriteAllowed';

/**
 * Ota-ona sessiyasi bilan GET bo'lmagan so'rov ham ruxsat etilgan endpoint (docs/02 §5:
 * `/auth/parent/*`; shuningdek `POST /auth/logout` — "Chiqish" ikkala cookie'ni o'chiradi).
 * Mutatsiya qiluvchi biznes endpointlarga QO'YILMAYDI.
 */
export const ParentWriteAllowed = (): MethodDecorator & ClassDecorator =>
  SetMetadata(PARENT_WRITE_ALLOWED_KEY, true);
