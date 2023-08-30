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
import { useModalStore } from '@/hooks/use-modal-store';

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
        <button className='w-full text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition'>
          {server.name} <ChevronDown className='w-5 h-5 ml-auto' />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]'>
        {isModerator ? (
          <DropdownMenuItem
            onClick={() => onOpen('invite', { server })}
            className='text-teal-600 dark:text-teal-400 px-3 py-2 text-sm cursor-pointer'
          >
            Invite People
            <UserPlus className='w-4 h-4 ml-auto' />
          </DropdownMenuItem>
        ) : null}
        {isAdmin ? (
          <>
            <DropdownMenuItem className='px-3 py-2 text-sm cursor-pointer'>
              Server Settings
              <Settings className='w-4 h-4 ml-auto' />
            </DropdownMenuItem>
            <DropdownMenuItem className='px-3 py-2 text-sm cursor-pointer'>
              Manage Members
              <Users className='w-4 h-4 ml-auto' />
            </DropdownMenuItem>
          </>
        ) : null}
        {isModerator ? (
          <>
            <DropdownMenuItem className='px-3 py-2 text-sm cursor-pointer'>
              Create Channel
              <PlusCircle className='w-4 h-4 ml-auto' />
            </DropdownMenuItem>

            <DropdownMenuSeparator />
          </>
        ) : null}
        {isAdmin ? (
          <>
            <DropdownMenuItem className='text-rose-500 px-3 py-2 text-sm cursor-pointer'>
              Delete Server
              <Trash className='w-4 h-4 ml-auto' />
            </DropdownMenuItem>
          </>
        ) : null}
        {!isAdmin ? (
          <>
            <DropdownMenuItem className='text-destructive px-3 py-2 text-sm cursor-pointer'>
              Leave Server
              <LogOut className='w-4 h-4 ml-auto' />
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
