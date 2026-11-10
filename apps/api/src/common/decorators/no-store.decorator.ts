import { Header } from '@nestjs/common';

import { NO_STORE } from '../constants/http.constants.js';

/** Javob keshlanmaydi — maxfiy qiymat (xom token, vaqtinchalik parol) qaytaradigan endpointlar uchun. */
export const NoStore = (): MethodDecorator => Header(NO_STORE.name, NO_STORE.value);
