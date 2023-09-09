'use client';

import { ServerWithMembersWithProfiles } from '@/types';
import { ChannelType, MemberRole } from '@prisma/client';
import { ActionTooltip } from '@/components/action-tooltip';
import { Plus, Settings } from 'lucide-react';
import { ModalType, useModalStore } from '@/hooks/stores/use-modal-store';

type ServerSectionProps = {
  label: string;
  role?: MemberRole;
  sectionType: 'channels' | 'members';
  channelType?: ChannelType;
  server?: ServerWithMembersWithProfiles;
};

export function ServerSection({
  label,
  role,
  sectionType,
  channelType,
  server,
}: ServerSectionProps) {
  const { onOpen } = useModalStore();

  return (
    <div className='flex items-center justify-between py-2'>
      <p className='text-xs uppercase font-semibold text-muted-foreground'>
        {label}
      </p>

      {role !== MemberRole.GUEST && sectionType === 'channels' && (
        <ActionTooltip label='Create Channel' side='top'>
          <button
            onClick={
              server &&
              (() =>
                onOpen({
                  type: ModalType.CREATE_CHANNEL,
                  data: {
                    server,
                    type: channelType,
                  },
                }))
            }
            className='text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-400'
          >
            <Plus className='w-4 h-4' />
          </button>
        </ActionTooltip>
      )}

      {role === MemberRole.ADMIN && sectionType === 'members' && (
        <ActionTooltip label='Manage Members' side='top'>
          <button
            onClick={
              server &&
              (() =>
                onOpen({
                  type: ModalType.MANAGE_MEMBERS,
                  data: { server },
                }))
            }
            className='text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-400'
          >
            <Settings className='w-4 h-4' />
          </button>
        </ActionTooltip>
      )}
    </div>
  );
}
