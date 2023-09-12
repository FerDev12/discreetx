'use client';

import '@uploadthing/react/styles.css';

import axios from 'axios';
import { X } from 'lucide-react';
import Image from 'next/image';

import { UploadButton } from '@/lib/uploadthing';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { useState } from 'react';

type FileUploadProps = {
  endpoint: 'messageFile' | 'serverImage';
  fileUrl: string;
  onChange: (fileUrl: string) => void;
};

export function ServerFileUpload({ fileUrl, onChange }: FileUploadProps) {
  const { toast } = useToast();
  const [fileKey, setFileKey] = useState('');

  const onDeleteImage = async () => {
    if (!fileUrl) return;
    try {
      const query = new URLSearchParams({
        imageId: fileKey,
      });
      await axios.delete(`/api/uploadthing?${query}`);
      onChange('');
    } catch (err: any) {
      console.error('[DELETE_IMAGE_ERROR]', err);
    }
  };

  if (fileUrl.length > 0) {
    return (
      <div className='relative h-20 w-20'>
        <Image fill src={fileUrl} alt='Upload' className='rounded-md' />
        <Button
          size='icon'
          variant='destructive'
          className='rounded-full absolute -top-1 -right-1 shadow-sm w-4 h-4'
          type='button'
          onClick={onDeleteImage}
        >
          <X className='w-3 h-3' />
        </Button>
      </div>
    );
  }

  return (
    <UploadButton
      endpoint={'serverImage'}
      onClientUploadComplete={(res) => {
        const file = res?.at(0);
        if (file) {
          onChange(file.url);
          setFileKey(file.key);
        }
      }}
      onUploadError={(error) => {
        console.error(error);
        toast({
          title: 'File Upload Failed',
          description: error.message,
          variant: 'destructive',
        });
      }}
    />
  );
}
