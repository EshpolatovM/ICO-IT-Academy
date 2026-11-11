export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
}

interface ComboboxBaseProps {
  /** Joriy qidiruv natijalari (filtrlashni feature qiladi — komponent o'zi filtrlamaydi). */
  options: readonly ComboboxOption[];
  /** Qidiruv matni o'zgarganda (debounce va so'rov — feature hook'ida). */
  onSearchChange?: (query: string) => void;
  loading?: boolean;
  /** Natija bo'lmaganda ro'yxatda ko'rinadigan matn. */
  emptyText?: string;
  loadingText?: string;
  /** Ochiladigan ro'yxat (listbox) nomi — ekran o'quvchilar uchun. */
  listLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Xato holati: qizil chegara va `aria-invalid` (FormField'dan keladi). */
  invalid?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false;
  /** Tanlangan variant (yorlig'i bilan — u joriy qidiruv natijalarida bo'lmasligi mumkin). */
  value: ComboboxOption | null;
  onChange: (value: ComboboxOption | null) => void;
  /** Tanlovni tozalash tugmasi matni (ekran o'quvchilar uchun ham). */
  clearLabel?: string;
}

export interface ComboboxMultipleProps extends ComboboxBaseProps {
  multiple: true;
  value: readonly ComboboxOption[];
  onChange: (value: ComboboxOption[]) => void;
  /** Chip'dagi "olib tashlash" tugmasi nomi: `${label} — ${removeLabel}`. */
  removeLabel?: string;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;
