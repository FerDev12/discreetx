'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { UploadFileResponse } from 'uploadthing/client';
import { Loader2, UserCircle2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { UploadButton } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';

const colors = [
  'red',
  'green',
  'indigo',
  'yellow',
  'orange',
  'rose',
  'purple',
  'teal',
  'amber',
  'pink',
  'sky',
];

type MemberFileUploadProps = {
  onChange: (fileUrl: string) => void;
};

export function MemberFileUpload({ onChange }: MemberFileUploadProps) {
  const [file, setFile] = useState<UploadFileResponse | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [baseUrl, setBaseUrl] = useState<string>(
    'https://xdiscreet.vercel.app'
  );

  useEffect(() => {
    setBaseUrl(
      new URL(
        process.env.NEXT_PUBLIC_VERCEL_URL ?? 'https://xdiscreet.vercel.app'
      ).origin
    );
  }, []);

  const onDeleteImage = async () => {
    if (!file) return;

    try {
      const query = new URLSearchParams({
        imageId: file.key ?? '',
      });

      await axios.delete(`/api/uploadthing?${query}`);
      setFile(null);
      onChange('');
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        return console.error(err.response?.data);
      }
      console.error(err);
    }
  };

  return (
    <div className='flex flex-col items-center space-y-4'>
      <p className='text-xs text-muted-foreground'>
        Choose your avatar or{' '}
        <Button
          type='button'
          variant='link'
          className='p-0 text-xs'
          onClick={() => {
            (
              document
                .querySelector('.ut-button-container')
                ?.querySelector('input') as HTMLInputElement
            )?.click();
          }}
        >
          upload a picture
        </Button>
      </p>

      <div className='grid grid-cols-5 gap-2 place-items-center'>
        {colors.map((val) => (
          <button
            type='button'
            key={val}
            onClick={() => {
              setUploadingImage(false);
              setFile(null);
              setSelectedAvatar(val);
              onChange(baseUrl + `/avatars/${val}.png`);
              onDeleteImage();
            }}
            className={cn(
              `p-0.5 border-2 border-slate-900 dark:border-slate-100 hover:border-teal-500 rounded-full transition-colors`,
              selectedAvatar === val && 'border-teal-500'
            )}
          >
            <Avatar className='h-6 w-6'>
              <AvatarImage src={baseUrl + `/avatars/${val}.png`} />
              <AvatarFallback>
                <UserCircle2 className='text-muted-foreground' />
              </AvatarFallback>
            </Avatar>
          </button>
        ))}
      </div>

      {uploadingImage && (
        <div className='flex items-center justify-center'>
          <Loader2 className='w-4 h-4 animate-spin text-muted-foreground' />
        </div>
      )}

      {!!file && (
        <div className='w-fit p-1 rounded-full border-2 border-teal-500 relative'>
          <Avatar className='h-12 w-12'>
            <AvatarImage src={file.url} />
            <AvatarFallback>
              <UserCircle2 className='text-muted-foreground' />
            </AvatarFallback>
          </Avatar>

          <button
            type='button'
            onClick={onDeleteImage}
            className='p-0.5 bg-rose-500 rounded-full absolute top-0 right-0 -translate-y-1/2 overflow-hidden '
          >
            <X className='w-3 h-3 text-rose-50' />
          </button>
        </div>
      )}

      <div className='hidden ut-button-container'>
        <UploadButton
          endpoint='memberAvatar'
          onUploadBegin={() => {
            setUploadingImage(true);
          }}
          onClientUploadComplete={(res) => {
            setUploadingImage(false);
            const file = res?.at(0);
            if (file) {
              setSelectedAvatar(null);
              setFile(file);
              onChange(file.url);
            }
          }}
          onUploadError={() => setUploadingImage(false)}
        />
      </div>
    </div>
  );
}
