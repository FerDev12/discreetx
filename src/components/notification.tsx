'use client';

import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useNotificationStore } from '@/hooks/use-notification';
import { useEffect, useRef, useState } from 'react';
import { Terminal, User, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useConversationStore } from '@/hooks/stores/use-conversation-store';
import { Call } from '@prisma/client';

export function Notifications() {
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const { close, notifications, pop } = useNotificationStore();

  useEffect(() => {
    let interval = timeout.current;

    if (!notifications.length && interval) {
      return clearInterval(interval);
    }

    interval = setInterval(() => {
      if (pop && notifications.at(0)?.type !== 'call') {
        pop();
      }
    }, 6000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [notifications, pop]);

  return (
    <>
      {notifications.map((noti, i) => {
        if (noti.type === 'call') {
          return (
            <CallNotification key={noti.id ?? ''} {...noti.data} pop={pop} />
          );
        }
        return (
          <Notification
            i={i}
            key={noti.id ?? ''}
            type={noti.type}
            {...noti.data}
            isLast={i === notifications.length - 1}
          />
        );
      })}
    </>
  );
}

function Notification({
  id,
  i,
  type,
  title,
  description,
  href,
  isLast,
}: {
  i: number;
  id?: string;
  type: 'default' | 'destructive';
  title: string;
  description?: string;
  href?: string;
  isLast: boolean;
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (i === 0) return;
    ref.current.style.top = 8 + 4 * i + 'px';
    ref.current.style.right = 8 + 4 * i + 'px';
  }, [i]);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <Alert
      ref={ref}
      variant={type}
      className={cn(
        `fixed top-2 right-2 translate-x-[calc(100%+8px)] z-10 max-w-xs cursor-pointer`,
        show && isLast && 'translate-x-0 transition-transform',
        show && !isLast && 'translate-x-0',
        type === 'destructive' &&
          'bg-rose-50 text-rose-500 dark:bg-zinc-950 border-rose-500'
      )}
    >
      {href && (
        <Link href={href} className='hidden absolute inset-0 z-10'></Link>
      )}
      <Terminal className='w-4 h-4 text-rose-500' />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

type CallNotificationProps = {
  id?: string;
  from: {
    username: string;
    avatarUrl: string;
    memberId: string;
  };
  call: Call;
  serverId: string;
  pop: () => void;
};

function CallNotification({
  id,
  from,
  call,
  serverId,
  pop,
}: CallNotificationProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setActiveCall } = useConversationStore();

  const onDeclineCall = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const query = new URLSearchParams({
        conversationId: call.conversationId,
      });

      await axios.patch(`/api/socket/calls/${call.id}?${query}`, {
        declined: true,
        answered: false,
        cancelled: false,
      });

      pop();
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        return console.error(err.response?.data);
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onAnswerCall = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const query = new URLSearchParams({
        callId: call.id,
        conversationId: call.conversationId,
      });

      await axios.patch(`/api/socket/calls/${call.id}?${query}`, {
        declined: false,
        answered: true,
        cancelled: false,
      });

      pop();
      setActiveCall({ id: call.id, type: call.type });
      router.push(
        `/servers/${serverId}/conversations/${call.conversationId}/calls/${call.id}`
      );
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        return console.error(err.response?.data);
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Alert className={cn(`fixed top-2 right-2 z-20 max-w-xs`)}>
      <div className='flex items-center gap-x-2'>
        <Avatar>
          <AvatarImage src={from.avatarUrl} />
          <AvatarFallback>
            <User className='text-muted-foreground' />
          </AvatarFallback>
        </Avatar>

        <AlertTitle>{from.username} is calling you!</AlertTitle>
      </div>
      <AlertDescription className='flex items-center justify-end gap-x-2'>
        <Button variant='ghost' size='sm' onClick={onDeclineCall}>
          Decline
        </Button>
        <Button variant='primary' size='sm' onClick={onAnswerCall}>
          Answer
        </Button>
      </AlertDescription>
    </Alert>
  );
}
