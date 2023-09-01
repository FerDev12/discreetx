'use client';

import { format } from 'date-fns';
import { Loader2, ServerCrash } from 'lucide-react';
import {
  ElementRef,
  experimental_useOptimistic,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Member, Profile } from '@prisma/client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatInput } from './chat-input';
import { ChatItem } from './chat-item';
import { ChatWelcome } from './chat-welcome';
import { useChatQuery } from '@/hooks/use-chat-query';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { useChatScroll } from '@/hooks/use-chat-scroll';
import { MemberWithProfile, MessageWithMemberWithProfile } from '@/types';
import { useSocket } from '../providers/socket-provider';
import DeleteMessageModal from '../modals/delete-message-modal';
import MessageFileModal from '../modals/message-file-modal';

const DATE_FORMAT = 'd MMM yyyy, HH:mm';

type ChatMessagesProps = {
  name: string;
  profile: Profile;
  currentMember: MemberWithProfile;
  chatId: string;
  paramValue: string;
} & (
  | {
      type: 'channel';
      apiUrl: '/api/messages';
      paramKey: 'channelId';
      socketUrl: '/api/socket/messages';
      socketQuery: {
        channelId: string;
        serverId: string;
      };
    }
  | {
      type: 'conversation';
      otherMember: MemberWithProfile;
      apiUrl: '/api/direct-messages';
      paramKey: 'conversationId';
      socketUrl: '/api/socket/direct-messages';
      socketQuery: {
        conversationId: string;
      };
    }
);

export function ChatMessages({
  name,
  currentMember,
  chatId,
  apiUrl,
  socketQuery,
  socketUrl,
  paramKey,
  paramValue,
  ...props
}: ChatMessagesProps) {
  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;
  const { socket } = useSocket();

  const chatRef = useRef<ElementRef<'div'>>(null);
  const bottomRef = useRef<ElementRef<'div'>>(null);

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!socket) return;

    if (props.type !== 'conversation') return;
    const typingKey = `typing:${chatId}:${props.otherMember.id}`;

    socket.on(typingKey, (isTyping) => setIsTyping(isTyping));
  }, [props, chatId, socket]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    });

  useChatSocket({ addKey, updateKey, queryKey });

  const messages: MessageWithMemberWithProfile[] = useMemo(
    () =>
      (
        data?.pages.flat() as {
          items: MessageWithMemberWithProfile[];
          nextCursor: string | null;
        }[]
      )?.flatMap(({ items }) => items) ?? [],
    [data?.pages]
  );

  const [optimisticMessages, setOptimisticMessages] =
    experimental_useOptimistic(messages);

  const addOptimisticMessage = (message: MessageWithMemberWithProfile) =>
    setOptimisticMessages((state) => [message, ...state]);

  const deleteOptimisiticMessage = (messageId: string) =>
    setOptimisticMessages((state) => {
      const index = state.findIndex((message) => message.id === messageId);
      if (index < 0) return state;
      state[index].deleted = true;
      state[index].content = 'This message has been deleted';
      state[index].fileUrl = null;
      state[index].updatedAt = new Date();
      return [...state];
    });

  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: optimisticMessages.length,
  });

  if (status === 'loading') {
    return (
      <div className='flex flex-col flex-1 justify-center items-center'>
        <Loader2 className='w-7 h-7 text-zinc-500 animate-spin mb-4' />
        <p className='text-xs text-zinc-500 dark:text-zinc-400'>
          Loading messages...
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className='flex flex-col flex-1 justify-center items-center'>
        <ServerCrash className='w-7 h-7 text-zinc-500 mb-4' />
        <p className='text-xs text-zinc-500 dark:text-zinc-400'>
          Something went wrong!
        </p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea viewPortRef={chatRef} className='flex-1 py-4'>
        {!hasNextPage && <div className='flex-1' />}

        {!hasNextPage && <ChatWelcome type={props.type} name={name} />}

        {hasNextPage && (
          <div className='flex justify-center'>
            {isFetchingNextPage ? (
              <Loader2 className='h-6 w-6 text-zinc-500 animate-spin my-4' />
            ) : (
              <button
                onClick={() => fetchNextPage()}
                className='text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition text-xs my-4'
              >
                Load previous messages
              </button>
            )}
          </div>
        )}

        <ul className='flex flex-col-reverse mt-auto'>
          {optimisticMessages.map((message) => (
            <ChatItem
              key={message.id}
              id={message.id}
              content={message.content}
              fileUrl={message.fileUrl}
              deleted={message.deleted}
              timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
              isUpdated={message.updatedAt !== message.createdAt}
              currentMember={currentMember}
              member={message.member as Member & { profile: Profile }}
              socketUrl={socketUrl}
              socketQuery={socketQuery}
              deleteOptimisticMessage={deleteOptimisiticMessage}
            />
          ))}
        </ul>

        {props.type === 'conversation' && isTyping && (
          <li className='text-xs text-zinc-500 list-none pl-12 pt-4 italic flex items-baseline gap-x-1'>
            <p>
              <span className='font-semibold'>
                {props.otherMember.profile.name}
              </span>{' '}
              is typing
            </p>
            <div className='flex gap-x-0.5 items-baseline'>
              <span className=' animate-ping delay-0 w-0.5 h-0.5 bg-zinc-500 rounded-full' />
              <span className='animate-ping delay-50 w-0.5 h-0.5 bg-zinc-500 rounded-full' />
              <span className='animate-ping delay-100 w-0.5 h-0.5 bg-zinc-500 rounded-full' />
            </div>
          </li>
        )}

        <div ref={bottomRef} />
      </ScrollArea>

      {props.type === 'channel' ? (
        <ChatInput
          type='channel'
          chatId={chatId}
          name={name}
          currentMember={currentMember}
          apiUrl={socketUrl}
          query={socketQuery}
          addOptimisticMessage={addOptimisticMessage}
        />
      ) : (
        <ChatInput
          type='conversation'
          chatId={chatId}
          name={name}
          currentMember={currentMember}
          otherMember={props.otherMember}
          apiUrl={socketUrl}
          query={socketQuery}
          addOptimisticMessage={addOptimisticMessage}
        />
      )}
    </>
  );
}
