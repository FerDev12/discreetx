'use client';

import { UploadButton } from '@/lib/uploadthing';
import axios from 'axios';
import { FileIcon, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import Image from 'next/image';

type MessageFileUploadProps = {
  fileUrl?: string;
  endpoint: 'messageImage' | 'messagePdf' | 'messageVideo';
  onChange: (fileUrl: string) => void;
};

export async function MessageFileUpload({
  fileUrl,
  endpoint,
  onChange,
}: MessageFileUploadProps) {
  const [fileKey, setFileKey] = useState<string | null>(null);
  const fileType = fileUrl?.split('.').at(-1);
  const isImage = ['jpg', 'jpeg', 'png', 'webd'].includes(fileType ?? '');
  const isVideo =
    !isImage && ['mov', 'ogg', 'flv', 'mp4', 'webm'].includes(fileType ?? '');
  const isPdf = !isImage && !isVideo && fileType === 'pdf';

  const onDeleteFile = async () => {
    try {
      const query = new URLSearchParams({
        imageId: fileKey ?? '',
      });
      await axios.delete(`/api/uploadthing?${query}`);
      onChange('');
      setFileKey(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return console.error(err.response?.data);
      }
      console.error(err);
    }
  };

  if (fileUrl && isImage) {
    return (
      <div className='relative h-24 w-24 rounded-full'>
        <Image fill src={fileUrl} alt='Upload' className='rounded-md' />
        <Button
          size='icon'
          variant='destructive'
          className='rounded-full absolute -top-1 -right-1 shadow-sm w-4 h-4'
          type='button'
          onClick={onDeleteFile}
        >
          <X className='w-3 h-3' />
        </Button>
      </div>
    );
  }

  if (fileUrl && isVideo) {
    return (
      <div className='relative'>
        <video className='h-24 w-48 rounded-sm' muted>
          <source src={fileUrl} type={`video/${fileType}`}></source>
        </video>

        <Button
          size='icon'
          variant='destructive'
          className='rounded-full absolute -top-1 -right-1 shadow-sm w-4 h-4'
          type='button'
          onClick={onDeleteFile}
        >
          <X className='w-3 h-3' />
        </Button>
      </div>
    );
  }

  if (fileUrl && isPdf) {
    return (
      <div className='relative flex items-center p-2 mt-2 rounded-md bg-bakcground/10 bg-indigo-50'>
        <FileIcon className='h-10 w-10 fill-indigo-200 stroke-indigo-400 ' />
        <a
          href={fileUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='ml-2 text-start text-sm text-indigo-500 dark:text-indigo-400 hover:underline'
        >
          <Button
            size='icon'
            variant='destructive'
            className='rounded-full absolute -top-2 -right-2 shadow-sm w-6 h-6'
            type='button'
            onClick={onDeleteFile}
          >
            <X className='w-3 h-3' />
          </Button>
          {fileUrl}
        </a>
      </div>
    );
  }

  return (
    <UploadButton
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        const file = res?.at(0);
        if (file) {
          onChange(file.url);
          setFileKey(file.key);
        }
      }}
      onUploadError={(err) => {
        console.error(err);
        onChange('');
        setFileKey(null);
      }}
    />
  );
}
