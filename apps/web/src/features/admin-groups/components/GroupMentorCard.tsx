'use client';

import { useState } from 'react';

import type { AdminGroupDetail } from '@lms/shared';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Stack,
} from '@/components/ui';
import type { ComboboxOption } from '@/components/ui';

import { useAssignGroupMentor } from '../hooks/useGroupMutations';
import { personName } from '../lib/format';
import { mentorErrorText } from '../lib/group-errors';

import { MentorCombobox } from './MentorCombobox';

function currentOption(group: AdminGroupDetail): ComboboxOption | null {
  return group.mentor === null ? null : { value: group.mentor.id, label: personName(group.mentor) };
}

interface MentorActionsProps {
  hasMentor: boolean;
  canAssign: boolean;
  pending: boolean;
  onRemove: () => void;
  onAssign: () => void;
}

function MentorActions({ hasMentor, canAssign, pending, onRemove, onAssign }: MentorActionsProps) {
  return (
    <Stack direction="horizontal" gap="2" justify="end" wrap>
      {hasMentor ? (
        <Button variant="secondary" disabled={pending} onClick={onRemove}>
          Olib tashlash
        </Button>
      ) : null}
      <Button loading={pending} disabled={!canAssign} onClick={onAssign}>
        Biriktirish
      </Button>
    </Stack>
  );
}

/**
 * Mentor biriktirish (`PUT …/mentor`): tanlab "Biriktirish", yoki "Olib tashlash" → `null`.
 * Mentor almashganda karta qayta chiziladi (`key`), shuning uchun tanlov joriy mentordan boshlanadi.
 */
export function GroupMentorCard({ group }: { group: AdminGroupDetail }) {
  const [selected, setSelected] = useState<ComboboxOption | null>(() => currentOption(group));
  const assign = useAssignGroupMentor(group.id);
  const changed = (selected?.value ?? null) !== (group.mentor?.id ?? null);

  const save = (mentorId: string | null) => {
    assign.mutate({ mentorId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mentor</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack gap="3">
          <FormField
            label="Mentor"
            error={assign.isError ? mentorErrorText(assign.error) : undefined}
          >
            {(control) => (
              <MentorCombobox
                control={control}
                value={selected}
                disabled={assign.isPending}
                onChange={(option) => {
                  assign.reset();
                  setSelected(option);
                }}
              />
            )}
          </FormField>
          <MentorActions
            hasMentor={group.mentor !== null}
            canAssign={changed && selected !== null}
            pending={assign.isPending}
            onRemove={() => {
              save(null);
            }}
            onAssign={() => {
              save(selected?.value ?? null);
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
