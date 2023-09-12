'use client';

import '@uploadthing/react/styles.css';

import axios from 'axios';
import { FileIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { UploadButton } from '@/lib/uploadthing';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { UploadFileResponse } from 'uploadthing/client';

type MessageFileUploadProps = {
  fileType: 'image' | 'video' | 'pdf';
  isLoading: boolean;
  onChange: (fileUrl: string) => void;
};

export function MessageFileUpload({
  fileType,
  isLoading,
  onChange,
}: MessageFileUploadProps) {
  const [file, setFile] = useState<UploadFileResponse | null>(null);
  const { toast } = useToast();

  const onDeleteFile = async () => {
    try {
      const query = new URLSearchParams({
        imageId: file?.key ?? '',
      });

      await axios.delete(`/api/uploadthing?${query}`);
      onChange('');
      setFile(null);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        return console.error(err.response?.data);
      }
      console.error(err);
    }
  };

  const isPdf = fileType === 'pdf';
  const isImage = fileType === 'image';
  const isVideo = fileType === 'video';

  const endpoint = isPdf
    ? 'messagePdf'
    : isImage
    ? 'messageImage'
    : 'messageVideo';

  if (!!file && isPdf) {
    return (
      <div className='relative flex items-center p-2 mt-2 rounded-md bg-bakcground/10 bg-indigo-50'>
        <FileIcon className='h-16 w-16 fill-indigo-200 stroke-indigo-400 ' />
        <a
          href={file.url}
          target='_blank'
          rel='noopener noreferrer'
          className='ml-2 text-start text-sm text-indigo-500 dark:text-indigo-400 hover:underline'
        >
          <Button
            size='icon'
            variant='destructive'
            className='rounded-full absolute -top-2 -right-2 shadow-sm w-6 h-6 bg-rose-500'
            type='button'
            onClick={onDeleteFile}
            disabled={isLoading}
          >
            <X className='w-3 h-3' />
          </Button>
          {file?.name}
        </a>
      </div>
    );
  }

  if (!!file && isVideo) {
    return (
      <div className='relative'>
        <div className='overflow-hidden rounded-sm h-44 w-80 border border-zinc-800 dark:border-zinc-200'>
          <video autoPlay muted controls className='w-full h-full'>
            <source
              src={file.url}
              type={`video/${file.url.split('.').at(-1)}`}
            ></source>
          </video>

          <Button
            size='icon'
            variant='destructive'
            className='rounded-full absolute -top-1 -right-1 shadow-sm w-4 h-4 bg-rose-500'
            type='button'
            onClick={onDeleteFile}
            disabled={isLoading}
          >
            <X className='w-3 h-3' />
          </Button>
        </div>
        <p className='text-sm text-muted-foreground text-center'>{file.name}</p>
      </div>
    );
  }

  if (!!file && isImage) {
    return (
      <div>
        <div className='relative w-48 h-48 border border-zinc-800 dark:border-zinc-200'>
          <Image fill src={file.url} alt='Upload' className='rounded-md' />
          <Button
            size='icon'
            variant='destructive'
            className='rounded-full absolute -top-1 -right-1 shadow-sm w-4 h-4 bg-rose-500'
            type='button'
            onClick={onDeleteFile}
            disabled={isLoading}
          >
            <X className='w-3 h-3' />
          </Button>
        </div>
        <p className='mt-2 text-sm text-muted-foreground text-center'>
          {file.name}
        </p>
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
          setFile(file);
        }
      }}
      onUploadError={(err) => {
        console.error(err.message);
        toast({
          title: 'File Upload Failed',
          description: err.message,
          variant: 'destructive',
        });
      }}
    />
  );
}
