'use client';

import { ServerWithMembersWithProfiles } from '@/types';
import { MemberRole } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  LogOut,
  PlusCircle,
  Settings,
  Trash,
  UserPlus,
  Users,
} from 'lucide-react';
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import { ModalType, useModalStore } from '@/hooks/use-modal-store';

type ServerHeaderProps = {
  server: ServerWithMembersWithProfiles;
  role?: MemberRole;
};

export function ServerHeader({ server, role }: ServerHeaderProps) {
  const { onOpen } = useModalStore();
  const isAdmin = role === MemberRole.ADMIN;
  const isModerator = isAdmin || role === MemberRole.MODERATOR;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='focus:outline-none' asChild>
        <button className='group w-full text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition'>
          <span className='text-teal-500 group-hover:text-teal-500 transition-colors'>
            {server.name}
          </span>{' '}
          <ChevronDown className='w-5 h-5 ml-auto' />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]'>
        {isModerator ? (
          <DropdownMenuItem
            onClick={() => onOpen({ type: ModalType.INVITE, data: { server } })}
            className='text-teal-600 dark:text-teal-400 px-3 py-2 text-sm cursor-pointer'
          >
            Invite People
            <UserPlus className='w-4 h-4 ml-auto' />
          </DropdownMenuItem>
        ) : null}

        {isAdmin ? (
          <>
            <DropdownMenuItem
              onClick={() =>
                onOpen({ type: ModalType.EDIT_SERVER, data: { server } })
              }
              className='px-3 py-2 text-sm cursor-pointer'
            >
              Server Settings
              <Settings className='w-4 h-4 ml-auto' />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onOpen({ type: ModalType.MANAGE_MEMBERS, data: { server } })
              }
              className='px-3 py-2 text-sm cursor-pointer'
            >
              Manage Members
              <Users className='w-4 h-4 ml-auto' />
            </DropdownMenuItem>
          </>
        ) : null}

        {isModerator ? (
          <>
            <DropdownMenuItem
              onClick={() =>
                onOpen({ type: ModalType.CREATE_CHANNEL, data: { server } })
              }
              className='px-3 py-2 text-sm cursor-pointer'
            >
              Create Channel
              <PlusCircle className='w-4 h-4 ml-auto' />
            </DropdownMenuItem>

            <DropdownMenuSeparator />
          </>
        ) : null}

        {isAdmin ? (
          <>
            <DropdownMenuItem
              onClick={() =>
                onOpen({ type: ModalType.DELETE_SERVER, data: { server } })
              }
              className='text-rose-500 px-3 py-2 text-sm cursor-pointer'
            >
              Delete Server
              <Trash className='w-4 h-4 ml-auto' />
            </DropdownMenuItem>
          </>
        ) : null}

        {!isAdmin ? (
          <>
            <DropdownMenuItem
              onClick={() =>
                onOpen({ type: ModalType.LEAVE_SERVER, data: { server } })
              }
              className='text-rose-500 px-3 py-2 text-sm cursor-pointer'
            >
              Leave Server
              <LogOut className='w-4 h-4 ml-auto' />
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
