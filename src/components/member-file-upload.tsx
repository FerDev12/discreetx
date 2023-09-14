import axios from 'axios';
import { useState } from 'react';
import { UploadFileResponse } from 'uploadthing/client';
import { UserCircle2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { UploadButton } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';

const colors = [
  'red',
  'green',
  'indigo',
  'green',
  'yellow',
  'orange',
  'rose',
  'purple',
  'teal',
  'amber',
  'violet',
];

type MemberFileUploadProps = {
  onChange: (fileUrl: string) => void;
};

export function MemberFileUpload({ onChange }: MemberFileUploadProps) {
  const [file, setFile] = useState<UploadFileResponse | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const onDeleteImage = async () => {
    if (!file) return;

    try {
      const query = new URLSearchParams({
        imageId: file.key ?? '',
      });

      await axios.delete(`/api/uploadthing?${query}`);
      setFile(null);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        return console.error(err.response?.data);
      }
      console.error(err);
    }
  };

  return (
    <div className='flex flex-col items-center space-y-4'>
      <div className='grid grid-cols-5 gap-2 items-center'>
        {colors.map((val) => (
          <button
            key={val}
            onClick={() => {
              setFile(null);
              setSelectedAvatar(val);
              onChange(`/avatars/${val}`);
            }}
            className={cn(
              `bg-${val}-500 p-1 border border-slate-900 dark:border-slate-100 hover:border-teal-500 rounded-full`,
              selectedAvatar === val && 'border-teal-500'
            )}
          >
            <Avatar>
              <AvatarImage src={`/avatars/${val}`} />
              <AvatarFallback>
                <UserCircle2 className='text-muted-foreground' />
              </AvatarFallback>
            </Avatar>
          </button>
        ))}
      </div>

      <p className='text-xs text-muted-foreground'>
        Choose your avatar or <Button variant='link'>upload a picture</Button>
      </p>

      {!!file && (
        <div className='w-fit p-1 rounded-full border border-teal-500'>
          <Avatar className='relative'>
            <AvatarImage src={file.url} />
            <AvatarFallback>
              <UserCircle2 className='text-muted-foreground' />
            </AvatarFallback>

            <Button
              onClick={onDeleteImage}
              variant='destructive'
              className='p-1 roudned-full absolute top-0 right-0 -translate-y-1/2 translate-x-1/2'
            >
              <X className='h-2 w-2 text-rose-50' />
            </Button>
          </Avatar>
        </div>
      )}

      <UploadButton
        endpoint='memberAvatar'
        className='hidden'
        onClientUploadComplete={(res) => {
          const file = res?.at(0);
          if (file) {
            setSelectedAvatar(null);
            setFile(file);
            onChange(file.url);
          }
        }}
      />
    </div>
  );
}
