import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FileInput } from './FileInput';
import { FormField } from './FormField';

describe('FileInput', () => {
  it('FormField nomi bilan, tanlangan fayl nomi ko`rsatiladi va bog`lanadi', async () => {
    const onFileChange = vi.fn();
    render(
      <FormField label="CSV fayl" hint="Faqat .csv" error="Fayl tanlang">
        {(control) => <FileInput accept=".csv" onFileChange={onFileChange} {...control} />}
      </FormField>,
    );
    const input = screen.getByLabelText('CSV fayl');
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', '.csv');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleName('CSV fayl');
    expect(input).toHaveAccessibleDescription('Faqat .csv Fayl tanlang Fayl tanlanmagan');

    const file = new File(['id,name'], 'students.csv', { type: 'text/csv' });
    await userEvent.upload(input, file);
    expect(onFileChange).toHaveBeenCalledWith(file);
    expect(screen.getByText('students.csv')).toBeInTheDocument();
    expect(input).toHaveAccessibleDescription('Faqat .csv Fayl tanlang students.csv');
  });

  it('disabled holati', () => {
    render(<FileInput aria-label="Fayl" disabled />);
    expect(screen.getByLabelText('Fayl')).toBeDisabled();
  });
});
