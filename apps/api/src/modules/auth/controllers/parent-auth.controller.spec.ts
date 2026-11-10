import { GUARDS_METADATA } from '@nestjs/common/constants.js';

import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator.js';
import { CsrfHeaderGuard } from '../../../common/guards/csrf-header.guard.js';

import { ParentAuthController } from './parent-auth.controller.js';

import type { ParentCookiesService } from '../services/parent-cookies.service.js';
import type { ParentExchangeService } from '../services/parent-exchange.service.js';
import type { Response } from 'express';

function setup() {
  const parentCookies = { clearAll: jest.fn() };
  const controller = new ParentAuthController(
    {} as ParentExchangeService,
    parentCookies as unknown as ParentCookiesService,
  );
  return { controller, parentCookies, response: {} as Response };
}

describe('ParentAuthController.logout', () => {
  it("sessiyasiz ham ikkala cookie (ps, parent_tokens) o'chiriladi", () => {
    const { controller, parentCookies, response } = setup();

    controller.logout(response);

    expect(parentCookies.clearAll).toHaveBeenCalledWith(response);
  });

  it('public (sessiya talab qilinmaydi), lekin CSRF sarlavhasi majburiy', () => {
    const handler = Object.getOwnPropertyDescriptor(ParentAuthController.prototype, 'logout')
      ?.value as object;

    expect(Reflect.getMetadata(IS_PUBLIC_KEY, ParentAuthController)).toBe(true);
    expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual([CsrfHeaderGuard]);
  });
});
