/** Skript foydalanuvchiga tushunarli xabar bilan to'xtashi kerak bo'lgan holat (stack trace'siz). */
export class ScriptError extends Error {
  override readonly name = 'ScriptError';
}
