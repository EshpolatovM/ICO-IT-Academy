import type { ComboboxOption, ComboboxProps } from './Combobox.types';

/** Ikkala rejim (bitta / ko'p tanlov) uchun yagona tanlov interfeysi. */
export interface ComboboxSelection {
  selected: readonly ComboboxOption[];
  isSelected: (option: ComboboxOption) => boolean;
  /** Ro'yxatdan tanlash: bitta rejimda almashtiradi, ko'p rejimda qo'shadi yoki olib tashlaydi. */
  pick: (option: ComboboxOption) => void;
  remove: (option: ComboboxOption) => void;
}

function contains(list: readonly ComboboxOption[], option: ComboboxOption): boolean {
  return list.some((item) => item.value === option.value);
}

export function getComboboxSelection(props: ComboboxProps): ComboboxSelection {
  if (props.multiple === true) {
    const { value, onChange } = props;
    const remove = (option: ComboboxOption) => {
      onChange(value.filter((item) => item.value !== option.value));
    };
    return {
      selected: value,
      isSelected: (option) => contains(value, option),
      pick: (option) => {
        if (contains(value, option)) {
          remove(option);
        } else {
          onChange([...value, option]);
        }
      },
      remove,
    };
  }
  const { value, onChange } = props;
  const selected = value === null ? [] : [value];
  return {
    selected,
    isSelected: (option) => contains(selected, option),
    pick: onChange,
    remove: () => {
      onChange(null);
    },
  };
}
