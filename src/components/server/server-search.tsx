'use client';

import { Search } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

type ServerSearchProps = {
  data: {
    label: string;
    type: 'channel' | 'member';
    data: {
      id: string;
      name: string;
      icon: ReactNode;
    }[];
  }[];
};

export function ServerSearch({ data }: ServerSearchProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    addEventListener('keydown', down);

    return () => removeEventListener('keydown', down);
  }, []);

  const onClick = ({
    id,
    type,
  }: {
    id: string;
    type: 'channel' | 'member';
  }) => {
    setOpen(false);

    const basePath = `/servers/${params?.serverId}`;

    if (type === 'member') {
      return router.push(`${basePath}/conversations/${id}`);
    }

    if (type === 'channel') {
      return router.push(`${basePath}/channels/${id}`);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='group px-2 py-2 rounded-md flex items-center justify-between w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition '
      >
        <div className='flex items-center space-x-2'>
          <Search className='w-4 h-4 text-muted-foreground' />
          <p className='text-sm font-semibold text-muted-foreground group-hover:text-zinc-600 dark:group-hover:text-zinc-300'>
            Search
          </p>
        </div>
        <kbd className='pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder='Search all channels and members' />

        <CommandList>
          <CommandEmpty>No results found</CommandEmpty>

          {data.map(({ label, type, data }) =>
            data.length ? (
              <CommandGroup key={label} heading={label}>
                {data.map(({ id, icon, name }) => (
                  <CommandItem key={id} className='cursor-pointer relative'>
                    {icon}
                    <span>{name}</span>
                    <Link
                      href={`/servers/${params?.serverId}/${
                        type === 'channel' ? 'channels' : 'conversations'
                      }/${id}`}
                      className='absolute inset-0'
                      onClick={() => setOpen(false)}
                    ></Link>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
