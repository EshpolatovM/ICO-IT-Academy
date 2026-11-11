import { isApiError } from './api-error';
import { UNKNOWN_ERROR_MESSAGE } from './api.constants';

/** Xato matni: API xabari yoki umumiy matn. */
export function errorMessage(error: unknown): string {
  return isApiError(error) ? error.message : UNKNOWN_ERROR_MESSAGE;
}
