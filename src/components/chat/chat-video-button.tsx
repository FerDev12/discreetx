'use client';

import { Video, VideoOff } from 'lucide-react';
import { ActionTooltip } from '../action-tooltip';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function ChatVideoButton() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVideo = searchParams?.get('video') === 'true';
  const Icon = isVideo ? VideoOff : Video;
  const tooltipLabel = isVideo ? 'End video call' : 'Start video call';

  const onClick = () => {
    const query = new URLSearchParams({});
    query.set('video', !isVideo ? 'true' : 'false');

    const url = `${pathname ?? ''}?${query}`;
    console.log(url);

    router.push(url);
  };
  return (
    <ActionTooltip label={tooltipLabel} side='bottom'>
      <button onClick={onClick} className='hover:opacity-75 transition mr-4'>
        <Icon className='h-6 w-6 text-zinc-500 dark:text-zinc-400' />
      </button>
    </ActionTooltip>
  );
}
