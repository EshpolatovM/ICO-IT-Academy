import { Text } from '@/components/ui';

/**
 * Bosilmaydigan menyu bandi. `NavItem` da `disabled` holati yo'q — u `rassom-dizayner` ga so'ralgan;
 * qo'shilgach shu kompozitsiya `NavItem disabled` bilan almashtiriladi.
 */
export function DisabledNavItem({ label }: { label: string }) {
  return (
    <li>
      <Text
        as="span"
        variant="muted"
        aria-disabled="true"
        className="block cursor-not-allowed px-3 py-2 text-text-disabled"
      >
        {label}
      </Text>
    </li>
  );
}
