import { Hash } from 'lucide-react';

import { MobileToggle } from '@/components/mobile-toggle';
import { UserAvatar } from '@/components/user-avatar';
import { SocketIndicator } from '@/components/socket-indicator';
import { ChatVideoButton } from './chat-video-button';
import { ChatIsTyping } from './chat-is-typing-indicator';
// import { ChatAudioButton } from './chat-audio-button';
import { CallType, Member } from '@prisma/client';

type ChatHeaderProps = {
  serverId: string;
  name: string;
} & (
  | {
      type: 'conversation';
      conversationId: string;
      imageUrl: string;
      currentMember: Member;
      otherMember: Member;
      callId?: string;
      callActive?: boolean;
      callType?: CallType;
    }
  | {
      type: 'channel';
      imageUrl?: string;
    }
);

export function ChatHeader({
  serverId,
  name,
  imageUrl,
  ...props
}: ChatHeaderProps) {
  return (
    <header className='text-md font-semibold px-3 flex items-center min-h-[48px] h-12 border-neutral-200 dark:border-neutral-800 border-b-2 shadow-sm '>
      <MobileToggle serverId={serverId} />

      {props.type === 'channel' && (
        <Hash className='w-5 h-5 text-muted-foreground mr-2' />
      )}

      {props.type === 'conversation' && (
        <UserAvatar src={imageUrl} className='w-8 h-8 md:w-8 md:h-8 mr-2' />
      )}

      <div className='flex items-baseline gap-x-2'>
        <h3 className='font-semibold text-md text-zinc-950 dark:text-zinc-50'>
          {name}
        </h3>
        {props.type === 'conversation' && <ChatIsTyping />}
      </div>

      <div className='ml-auto flex items-center gap-x-2'>
        {props.type === 'conversation' && (
          <div className='flex items-center gap-x-1'>
            <ChatVideoButton
              callType={props.callType}
              callId={props.callId}
              callActive={props.callActive}
              otherMember={props.otherMember}
              conversationId={props.conversationId}
              serverId={serverId}
            />
          </div>
        )}
        <SocketIndicator />
      </div>
    </header>
  );
}
