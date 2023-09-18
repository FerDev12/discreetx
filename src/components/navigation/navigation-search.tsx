'use client';

import { SearchIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

type ServerSearchProps = {
  servers: { id: string; name: string; imageUrl: string }[];
};

export function NavigationSearch({ servers }: ServerSearchProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant='ghost' size='icon' onClick={() => setOpen(true)}>
        <SearchIcon className='w-6 h-6' />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder='Search all servers' />

        <CommandList>
          <CommandEmpty>No results found</CommandEmpty>

          <CommandGroup heading={'Servers'}>
            {servers.map(({ id, imageUrl, name }) => (
              <CommandItem
                key={id}
                className='relative flex items-center gap-x-4 cursor-pointer'
              >
                <div className='relative w-10 h-10 rounded-md overflow-hidden'>
                  <Image src={imageUrl} alt='server image' fill />
                </div>
                <span className='font-medium'>{name}</span>
                <Link
                  href={`/servers/${id}`}
                  className='absolute inset-0'
                  onClick={() => setOpen(false)}
                ></Link>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
