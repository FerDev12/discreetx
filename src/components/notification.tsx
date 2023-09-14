'use client';

import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useNotificationStore } from '@/hooks/use-notification';
import { useEffect, useRef, useState } from 'react';
import { Terminal, X } from 'lucide-react';

export function Notifications() {
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const { close, notifications, pop } = useNotificationStore();

  useEffect(() => {
    console.log(notifications);
  }, [notifications]);

  useEffect(() => {
    let interval = timeout.current;

    if (!notifications.length && interval) {
      return clearInterval(interval);
    }

    interval = setInterval(() => {
      if (pop) {
        pop();
      }
    }, 6000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [notifications, pop]);

  return (
    <>
      {notifications.map(({ id, variant, title, description }, i) => (
        <Notification
          key={id}
          i={i}
          id={id}
          variant={variant}
          title={title}
          description={description}
          last={i === notifications.length}
          close={close}
        />
      ))}
    </>
  );
}

function Notification({
  i,
  id,
  title,
  description,
  variant = 'default',
  last,
  close,
}: {
  i: number;
  id: string;
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
  last: boolean;
  close: (id: string) => void;
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (i === 0) return;
    ref.current.style.top = 8 + 8 * i + 'px';
    ref.current.style.right = 8 + 8 * i + 'px';
  }, [i]);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <Alert
      ref={ref}
      variant={variant}
      className={cn(
        `fixed top-2 right-2 translate-x-[calc(100%+8px)] z-10 max-w-xs`,
        show && last && 'translate-x-0 transition-transform',
        show && !last && 'translate-x-0',
        variant === 'destructive' &&
          'bg-rose-50 text-rose-500 dark:bg-zinc-950 border-rose-500'
      )}
    >
      <Terminal className='w-4 h-4 text-rose-500' />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
