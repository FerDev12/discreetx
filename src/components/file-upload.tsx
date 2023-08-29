'use client';

import '@uploadthing/react/styles.css';

import { X } from 'lucide-react';
import Image from 'next/image';
import { UploadDropzone } from '@/lib/uploadthing';
import { Button } from './ui/button';

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
  const fileType = value?.split('.').pop();

  if (value && fileType !== 'pdf') {
    return (
      <div className='relative h-20 w-20'>
        <Image fill src={value} alt='Upload' className='rounded-full' />
        <Button
          size='icon'
          variant='destructive'
          onClick={() => onChange('')}
          className='rounded-full absolute top-0 right-0 shadow-sm w-6 h-6'
          type='button'
        >
          <X className='w-4 h-4' />
        </Button>
      </div>
    );
  }
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
    />
  );
}
