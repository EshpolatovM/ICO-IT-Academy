import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { FormField } from './FormField';
import { SearchInput } from './SearchInput';
import { Select } from './Select';
import { Textarea } from './Textarea';

const OPTIONS = [
  { value: 'ACTIVE', label: 'Faol' },
  { value: 'INACTIVE', label: 'Nofaol', disabled: true },
];

describe('Select', () => {
  it('FormField bilan bog`lanadi, placeholder bo`sh qiymatli', () => {
    render(
      <FormField label="Status" error="Tanlang">
        {(control) => <Select options={OPTIONS} placeholder="Hammasi" {...control} />}
      </FormField>,
    );
    const select = screen.getByRole('combobox', { name: 'Status' });
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Tanlang');
    expect(select).toHaveClass('border-danger');
    expect(select).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Nofaol' })).toBeDisabled();
  });

  it('variant tanlanadi', async () => {
    const onChange = vi.fn();
    render(<Select aria-label="Status" options={OPTIONS} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'ACTIVE');
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveValue('ACTIVE');
  });
});

describe('Textarea', () => {
  it('xato va disabled holatlari', () => {
    render(<Textarea aria-label="Izoh" invalid disabled />);
    const textarea = screen.getByRole('textbox', { name: 'Izoh' });
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute('rows', '4');
    expect(textarea).toBeDisabled();
  });
});

function ControlledSearch({ onValue }: { onValue: (value: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <SearchInput
      aria-label="Qidiruv"
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onValue(next);
      }}
    />
  );
}

describe('SearchInput', () => {
  it('yozish va tozalash, tozalagandan keyin fokus maydonda', async () => {
    const onValue = vi.fn();
    render(<ControlledSearch onValue={onValue} />);
    const input = screen.getByRole('searchbox', { name: 'Qidiruv' });
    expect(screen.queryByRole('button', { name: 'Tozalash' })).not.toBeInTheDocument();

    await userEvent.type(input, 'ST');
    expect(onValue).toHaveBeenLastCalledWith('ST');

    await userEvent.click(screen.getByRole('button', { name: 'Tozalash' }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Tozalash' })).not.toBeInTheDocument();
  });
});
