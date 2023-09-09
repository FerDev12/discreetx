'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ManageMembersModalData,
  ModalType,
  useModalStore,
} from '@/hooks/stores/use-modal-store';
import { ServerWithMembersWithProfiles } from '@/types';
import { ScrollArea } from '../ui/scroll-area';
import { UserAvatar } from '../user-avatar';
import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  User2,
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MemberRole } from '@prisma/client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function MembersModal() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState('');
  const { isOpen, type, data, onOpen, onClose } = useModalStore();
  const user = useUser();
  const { server } = data as ManageMembersModalData;
  const roleIconMap = new Map();
  roleIconMap.set('GUEST', null);
  roleIconMap.set(
    'MODERATOR',
    <ShieldCheck className='h-4 w-4 ml-3 text-indigo-500' />
  );
  roleIconMap.set('ADMIN', <ShieldAlert className='h-4 w-4 text-rose-500' />);

  const isModalOpen = isOpen && type === ModalType.MANAGE_MEMBERS;
  const members = (server as ServerWithMembersWithProfiles)?.members;

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId);

      const query = new URLSearchParams({
        serverId: server?.id ?? '',
      });

      const { data } = await axios.patch(
        `/api/socket/members/${memberId}?${query}`,
        {
          role,
        }
      );

      onOpen({ type: ModalType.MANAGE_MEMBERS, data });
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    } finally {
      setLoadingId('');
    }
  };

  const onKick = async (memberId: string) => {
    try {
      setLoadingId(memberId);

      const query = new URLSearchParams({
        serverId: server?.id ?? '',
      });

      const { data } = await axios.delete(
        `/api/socket/members/${memberId}?${query}`
      );

      onOpen({ type: ModalType.MANAGE_MEMBERS, data });
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className='dark:bg-zinc-900 border-teal-500 border-2 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>
            Manage Members
          </DialogTitle>

          <DialogDescription className='text-center text-muted-foreground'>
            {members?.length} Members
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='mt-8 max-h-[420px] pr-6'>
          <ul className='flex flex-col space-y-6'>
            {members?.map((member) => (
              <li key={member.id} className='flex justify-between items-center'>
                <div className='flex items-center justify-between space-x-4'>
                  <UserAvatar src={member.profile.imageUrl} />

                  <div className='flex flex-col space-y-1'>
                    <div className='flex space-x-2 items-center'>
                      <p className='text-md'>{member.profile.name} </p>

                      {roleIconMap.get(member.role)}
                      {member.profile.name === user?.user?.fullName && (
                        <span className='text-xs'>{'(YOU)'}</span>
                      )}
                    </div>

                    <p className='text-xs text-muted-foreground'>
                      {member.profile.email}
                    </p>
                  </div>
                </div>
                {server?.profileId !== member.profileId &&
                  loadingId !== member.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className='w-4 h-4' />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent side='left'>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className='flex items-center cursor-pointer'>
                            <ShieldQuestion className='w-4 h-4 mr-2' />
                            <span>Role</span>
                          </DropdownMenuSubTrigger>

                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                onClick={() => onRoleChange(member.id, 'GUEST')}
                                className='cursor-pointer'
                              >
                                <User2 className='w-4 h-4 mr-2' />
                                GUEST
                                {member.role === 'GUEST' && (
                                  <Check className='2-4 h-4 ml-auto' />
                                )}
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() =>
                                  onRoleChange(member.id, 'MODERATOR')
                                }
                                className='cursor-pointer'
                              >
                                <ShieldCheck className='w-4 h-4 mr-2' />
                                MODERATOR
                                {member.role === 'MODERATOR' && (
                                  <Check className='2-4 h-4 ml-auto' />
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className='text-amber-500 cursor-pointer'
                          onClick={() => onKick(member.id)}
                        >
                          <Gavel className='w-4 h-4 mr-2' />
                          Kick
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                {loadingId === member.id && (
                  <Loader2 className='w-4 h-4 ml-auto animate-spin' />
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
