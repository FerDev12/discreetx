'use client';

import '@uploadthing/react/styles.css';

import { X } from 'lucide-react';
import Image from 'next/image';
import { UploadDropzone } from '@/lib/uploadthing';
import { Button } from './ui/button';
import axios from 'axios';
import { useState } from 'react';

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
  const [fileKey, setFileKey] = useState('');

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

  if (value && fileType !== 'pdf') {
    return (
      <div className='relative h-20 w-20'>
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
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        const file = res?.[0];

        setFileKey(file?.key ?? '');
        onChange(file?.url);
      }}
    />
  );
}
