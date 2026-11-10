import path from 'node:path';

/**
 * lint-staged (Husky pre-commit). ESLint har bir paketning o'z config'i bilan shu paket
 * papkasidan ishga tushiriladi, so'ng Prettier. Bir fayl ustida buyruqlar ketma-ket ishlaydi.
 */
const ESLINT_WORKSPACES = ['apps/api', 'apps/web', 'packages/shared', 'packages/config'];

const root = import.meta.dirname;

/** @param {string[]} files */
const quote = (files) => files.map((file) => `"${file}"`).join(' ');

/** @param {string} file */
function workspaceOf(file) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  return ESLINT_WORKSPACES.find((workspace) => relative.startsWith(`${workspace}/`));
}

/** @param {string[]} files */
function eslintCommands(files) {
  const byWorkspace = new Map();
  for (const file of files) {
    const workspace = workspaceOf(file);
    if (workspace) {
      byWorkspace.set(workspace, [...(byWorkspace.get(workspace) ?? []), file]);
    }
  }
  return [...byWorkspace].map(
    ([workspace, workspaceFiles]) =>
      `pnpm --dir ${workspace} exec eslint --fix --max-warnings 0 --no-warn-ignored ${quote(workspaceFiles)}`,
  );
}

export default {
  '*.{ts,tsx,js,jsx,mjs,cjs}': (files) => [
    ...eslintCommands(files),
    `prettier --write --ignore-unknown ${quote(files)}`,
  ],
  '*.{json,md,yml,yaml,css,scss,html}': 'prettier --write --ignore-unknown',
};
