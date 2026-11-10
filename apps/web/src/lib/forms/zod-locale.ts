import { z } from 'zod';

/**
 * Zod standart xabarlari o'zbek tilida (masalan `min(1)` — "Juda kichik ..."). `@lms/shared`
 * sxemalaridagi aniq xabarlar (parol siyosati, telefon formati) o'zgarmaydi.
 */
z.config(z.locales.uz());
