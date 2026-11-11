import { FormField, Select } from '@/components/ui';

/**
 * Guruh filtri uchun joy (`groupId`, docs/12 §2.1). Guruhlar API'si (2.3) tayyor bo'lgach bu yerga
 * guruhlar ro'yxati ulanadi va `useListUrlState` ga `setGroupId` qo'shiladi.
 */
export function GroupFilterPlaceholder() {
  return (
    <FormField label="Guruh" hint="Tez orada" className="w-48">
      {({ invalid: _invalid, required: _required, ...control }) => (
        <Select {...control} options={[]} placeholder="Hammasi" disabled value="" />
      )}
    </FormField>
  );
}
