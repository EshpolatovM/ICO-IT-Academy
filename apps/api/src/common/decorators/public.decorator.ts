import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'auth:isPublic';

/** Endpoint autentifikatsiyasiz ochiq (docs/12: `PUB`). Faqat hujjatda public deyilgan joylarda. */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
