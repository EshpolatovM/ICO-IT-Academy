import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { ParentExchangeResponse } from '@lms/shared';

import { NO_REFERRER } from '../../../common/constants/http.constants.js';
import { ClientMeta } from '../../../common/decorators/client-meta.decorator.js';
import { NoStore } from '../../../common/decorators/no-store.decorator.js';
import { ParentWriteAllowed } from '../../../common/decorators/parent-write-allowed.decorator.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import { CsrfHeaderGuard } from '../../../common/guards/csrf-header.guard.js';
import { ParentTokensCookie } from '../decorators/parent-cookies.decorator.js';
import { ParentExchangeDto } from '../dto/auth.dto.js';
import { ParentCookiesService } from '../services/parent-cookies.service.js';
import { ParentExchangeService } from '../services/parent-exchange.service.js';

import type { ClientMeta as ClientMetaValue } from '../../../common/auth/request-user.types.js';
import type { Response } from 'express';

/** Ota-ona kirishi (docs/12 §1: PUB). Sessiya `ps`, tokenlar shifrlangan `parent_tokens` cookie'da. */
@Public()
@ParentWriteAllowed()
@Controller('auth/parent')
export class ParentAuthController {
  constructor(
    private readonly parentExchange: ParentExchangeService,
    private readonly parentCookies: ParentCookiesService,
  ) {}

  @Post('exchange')
  @HttpCode(HttpStatus.OK)
  @Header(NO_REFERRER.name, NO_REFERRER.value)
  @NoStore()
  exchange(
    @Body() dto: ParentExchangeDto,
    @ParentTokensCookie() storedCookie: string | undefined,
    @ClientMeta() meta: ClientMetaValue,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ParentExchangeResponse> {
    return this.parentExchange.exchange({ dto, storedCookie, meta, response });
  }

  /**
   * Ota-ona "Chiqish" (docs/02 §5.1): `ps` va `parent_tokens` o'chiriladi. Sessiya talab qilinmaydi —
   * `ps` muddati o'tgan bo'lsa ham cookie'lar tozalanadi. Holat o'zgarmaydi (JWT stateless).
   * CSRF: `X-Requested-With` majburiy (boshqa saytdan majburan chiqarib yuborilmasligi uchun).
   */
  @UseGuards(CsrfHeaderGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response): void {
    this.parentCookies.clearAll(response);
  }
}
