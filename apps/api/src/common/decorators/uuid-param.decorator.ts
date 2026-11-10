import { Param } from '@nestjs/common';

import { ParseUuidPipe } from '../pipes/parse-uuid.pipe.js';

/** UUID bo'lishi shart bo'lgan URL parametri (`@Param(name, ParseUuidPipe)`; docs/12 §0 xato formati). */
export const UuidParam = (name: string): ParameterDecorator => Param(name, ParseUuidPipe);
