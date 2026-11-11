'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';

import { useCreateGroup } from '../hooks/useGroupMutations';
import { groupDetailPath } from '../lib/admin-groups-paths';

import { CreateGroupForm } from './CreateGroupForm';

/** "Yangi guruh" oynasi: muvaffaqiyatda guruh sahifasiga o'tiladi (a'zolar qo'shish uchun). */
export function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const create = useCreateGroup();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Yangi guruh</Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Yangi guruh</DialogTitle>
        </DialogHeader>
        <CreateGroupForm
          onCancel={() => {
            setOpen(false);
          }}
          onValid={async (values) => {
            const group = await create.mutateAsync(values);
            setOpen(false);
            router.push(groupDetailPath(group.id));
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
