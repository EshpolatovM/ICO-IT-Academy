import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Ilovadagidek: zod standart xabarlari o'zbekcha (src/app/providers.tsx).
import './src/lib/forms/zod-locale';

afterEach(() => {
  cleanup();
});
