'use client';

import '@uploadthing/react/styles.css';

import { FileIcon, X } from 'lucide-react';
import Image from 'next/image';
import { UploadButton } from '@/lib/uploadthing';
import { Button } from './ui/button';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useToast } from './ui/use-toast';

type FileUploadProps = {
  endpoint: 'messageFile' | 'serverImage';
  value?: string;
  onChange: (url?: string) => void;
};

export default function FileUpload({
  endpoint,
  value,
  onChange,
}: FileUploadProps) {
  const fileType = value?.split('.').at(-1);
  const [fileKey, setFileKey] = useState('');
  const { toast } = useToast();

  const onDeleteImage = async () => {
    try {
      const query = new URLSearchParams({
        imageId: fileKey ?? '',
      });
      await axios.delete(`/api/uploadthing?${query}`);

      onChange('');
    } catch (err: any) {
      console.error('[DELETE_IMAGE_ERROR]', err);
    }
  };

  useEffect(() => {
    console.log(fileType);
  }, [fileType]);

  if (value && fileType === 'mp4') {
    return (
      <video controls className='h-40 w-72 rounded-sm'>
        <source src={value} type={`video/${fileType}`}></source>
      </video>
    );
  }

  if (value && fileType !== 'pdf') {
    return (
      <div className='relative h-40 w-40'>
        <Image fill src={value} alt='Upload' className='rounded-full' />
        <Button
          size='icon'
          variant='destructive'
          className='rounded-full absolute top-0 right-0 shadow-sm w-6 h-6'
          type='button'
          onClick={onDeleteImage}
        >
          <X className='w-4 h-4' />
        </Button>
      </div>
    );
  }

  if (value && fileType === 'pdf') {
    return (
      <div className='relative flex items-center p-2 mt-2 rounded-md bg-bakcground/10 bg-indigo-50'>
        <FileIcon className='h-10 w-10 fill-indigo-200 stroke-indigo-400 ' />
        <a
          href={value}
          target='_blank'
          rel='noopener noreferrer'
          className='ml-2 text-start text-sm text-indigo-500 dark:text-indigo-400 hover:underline'
        >
          <Button
            size='icon'
            variant='destructive'
            className='rounded-full absolute -top-2 -right-2 shadow-sm w-6 h-6'
            type='button'
            onClick={onDeleteImage}
          >
            <X className='w-4 h-4' />
          </Button>
          {value}
        </a>
      </div>
    );
  }

  return (
    <UploadButton
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        const file = res?.at(0);

        setFileKey(file?.key ?? '');
        onChange(file?.url);
      }}
      onUploadError={(error) => {
        console.error(error);
        toast({
          title: 'File Upload Failed',
          variant: 'destructive',
        });
      }}
    />
  );
}
