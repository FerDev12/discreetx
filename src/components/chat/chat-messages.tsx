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
import { useChatQuery } from '@/hooks/queries/use-chat-query';
import { useChatSocket } from '@/hooks/sockets/use-chat-socket';
import { useChatScroll } from '@/hooks/use-chat-scroll';
import { MemberWithProfile, MessageWithMemberWithProfile } from '@/types';
import { useConfeti } from '@/hooks/use-confetti';
import { cn } from '@/lib/utils';

const DATE_FORMAT = 'd MMM yyyy, HH:mm';

type ChatMessagesProps = {
  name: string;
  currentMember: MemberWithProfile;
  chatId: string;
  paramValue: string;
} & (
  | {
      type: 'channel';
      apiUrl: '/api/messages';
      paramKey: 'channelId';
      socketUrl: string;
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
      socketUrl: string;
      socketQuery: {
        conversationId: string;
        memberId: string;
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
  const typingKey =
    props.type === 'conversation'
      ? `chat:${chatId}:istyping:${props.otherMember.id}`
      : null;

  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const chatRef = useRef<ElementRef<'div'>>(null);
  const bottomRef = useRef<ElementRef<'div'>>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    });
  useChatSocket({ addKey, updateKey, queryKey, typingKey });
  const { confetti } = useConfeti();

  useEffect(() => {
    let timer = timeoutRef.current;
    if (Date.now() - new Date(currentMember.createdAt).getTime() < 10000) {
      confetti.play();
      setShowWelcomeMessage(true);
      if (timer) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          setShowWelcomeMessage(false);
        }, 10000);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentMember.createdAt, confetti]);

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

  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: optimisticMessages.length,
  });

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
      <div
        className={cn(
          'fixed top-0 left-1/2 -translate-x-1/2 border border-t-0 border-teal-500 rounded-b-sm py-2 px-4 bg-zinc-50 dark:bg-zinc-900 -translate-y-full',
          showWelcomeMessage && 'translate-y-0 transition-transform'
        )}
      >
        <h2 className='text-md text-center font-semibold'>
          Welcome,{' '}
          <span className='text-teal-500'>{currentMember.profile.name}</span>!!!
          🥳🎉🎊
        </h2>
      </div>

      <ScrollArea
        viewPortRef={chatRef}
        viewPortClass='flex items-end px-4'
        className='flex-1 py-4 h-full'
      >
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
              sent={message.sent}
              deleted={message.deleted}
              timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
              isUpdated={
                'edited' in message
                  ? !!message.edited
                  : message.updatedAt !== message.createdAt
              }
              currentMember={currentMember}
              member={message.member as Member & { profile: Profile }}
              socketUrl={socketUrl}
              socketQuery={socketQuery}
              deleteOptimisticMessage={deleteOptimisiticMessage}
            />
          ))}
        </ul>

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
