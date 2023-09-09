'use client';

import { cn } from '@/lib/utils';
import { Channel, ChannelType, MemberRole, Server } from '@prisma/client';
import { Edit, Hash, Lock, LucideIcon, Mic, Trash, Video } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { ActionTooltip } from '../action-tooltip';
import { ModalType, useModalStore } from '@/hooks/stores/use-modal-store';
import { MouseEvent } from 'react';

type ServerChannelProps = {
  channel: Channel;
  server: Server;
  role?: MemberRole;
};

const iconMap = new Map<ChannelType, LucideIcon>();
iconMap.set(ChannelType.TEXT, Hash);
iconMap.set(ChannelType.AUDIO, Mic);
iconMap.set(ChannelType.VIDEO, Video);

export function ServerChannel({ channel, server, role }: ServerChannelProps) {
  const params = useParams();
  const router = useRouter();

  const { onOpen } = useModalStore();

  const Icon = iconMap.get(channel.type)!;

  const onClick = () => {
    router.push(`/servers/${params?.serverId}/channels/${channel.id}`);
  };

  const onAction = (
    e: MouseEvent,
    action: ModalType.EDIT_CHANNEL | ModalType.DELETE_CHANNEL
  ) => {
    e.stopPropagation();
    onOpen({ type: action, data: { server, channel } });
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1',
        params?.channelId === channel.id &&
          'bg-zinc-700/20 dark:hover:bg-zinc-700/50 transition mb-1'
      )}
    >
      <Icon className='flex-shrink-0 w-5 h-5 text-muted-foreground' />
      <p
        className={cn(
          'line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition',
          params?.channelId === channel.id &&
            'text-primary dark:text-zinc-200 dark:group-hover:text-zinc-50'
        )}
      >
        {channel.name}
      </p>

      {channel.name !== 'general' && role !== MemberRole.GUEST && (
        <div className='ml-auto flex items-center gap-x-2'>
          <ActionTooltip label='Edit'>
            <Edit
              onClick={(e) => onAction(e, ModalType.EDIT_CHANNEL)}
              className='hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition'
            />
          </ActionTooltip>

          <ActionTooltip label='Delete'>
            <Trash
              onClick={(e) => onAction(e, ModalType.DELETE_CHANNEL)}
              className='hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition'
            />
          </ActionTooltip>
        </div>
      )}

      {channel.name === 'general' && (
        <Lock className='ml-auto w-4 h-4 text-zinc-500 dark:text-zinc-400' />
      )}
    </button>
  );
}
