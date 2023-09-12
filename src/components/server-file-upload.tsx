'use client';

import '@uploadthing/react/styles.css';

import axios from 'axios';
import { FileIcon, X } from 'lucide-react';
import Image from 'next/image';

import { UploadButton } from '@/lib/uploadthing';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

type FileUploadProps = {
  endpoint: 'messageFile' | 'serverImage';
  values?: {
    name: string;
    size: number;
    url: string;
    key: string;
  }[];
  onChange: (
    values: { name: string; size: number; url: string; key: string }[]
  ) => void;
};

export default function FileUpload({
  endpoint,
  values,
  onChange,
}: FileUploadProps) {
  const { toast } = useToast();

  const onDeleteImage = async (fileKey: string) => {
    try {
      const query = new URLSearchParams({
        imageId: fileKey ?? '',
      });
      await axios.delete(`/api/uploadthing?${query}`);

      onChange(values?.filter((file) => file.key === fileKey) ?? []);
    } catch (err: any) {
      console.error('[DELETE_IMAGE_ERROR]', err);
    }
  };

  if (values && values.length > 0) {
    return (
      <div className='flex gap-2 flex-wrap w-full'>
        {values.map(({ url, key }, i) => {
          const fileType = url.split('.').at(-1);

          if (!fileType) return null;

          if (fileType === 'mp4') {
            return (
              <video key={key} className='h-20 w-20 rounded-sm' muted>
                <source src={url} type={`video/${fileType}`}></source>
              </video>
            );
          }

          if (fileType === 'pdf') {
            return (
              <div
                key={key}
                className='relative flex items-center p-2 mt-2 rounded-md bg-bakcground/10 bg-indigo-50'
              >
                <FileIcon className='h-10 w-10 fill-indigo-200 stroke-indigo-400 ' />
                <a
                  href={url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='ml-2 text-start text-sm text-indigo-500 dark:text-indigo-400 hover:underline'
                >
                  <Button
                    size='icon'
                    variant='destructive'
                    className='rounded-full absolute -top-2 -right-2 shadow-sm w-6 h-6'
                    type='button'
                    onClick={() => onDeleteImage(key)}
                  >
                    <X className='w-4 h-4' />
                  </Button>
                  {url}
                </a>
              </div>
            );
          }

          if (fileType !== 'pdf') {
            return (
              <div key={key} className='relative h-20 w-20'>
                <Image fill src={url} alt='Upload' className='rounded-md' />
                <Button
                  size='icon'
                  variant='destructive'
                  className='rounded-full absolute -top-1 -right-1 shadow-sm w-4 h-4'
                  type='button'
                  onClick={() => onDeleteImage(key)}
                >
                  <X className='w-3 h-3' />
                </Button>
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  }

  return (
    <UploadButton
      appearance={{
        button: {},
      }}
      endpoint={'serverImage'}
      onClientUploadComplete={(res) => {
        if (!res || res.length === 0) return;
        onChange(res);
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
