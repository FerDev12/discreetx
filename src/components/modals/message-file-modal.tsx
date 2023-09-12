'use client';

import axios from 'axios';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { FileIcon, Loader2, X } from 'lucide-react';
import {
  MessageFileModalData,
  useModalStore,
} from '@/hooks/stores/use-modal-store';
import { UploadButton } from '@/lib/uploadthing';
import { useToast } from '../ui/use-toast';
import { useState } from 'react';
import { UploadFileResponse } from 'uploadthing/client';
import { Input } from '../ui/input';

const getFileType = (url: string) => url.split('.')?.at(-1);

const formSchema = z.object({
  content: z.string(),
  fileUrl: z.string().url().nonempty(),
});

export default function MessageFileModal() {
  const { isOpen, onClose, type, data } = useModalStore();
  const [file, setFile] = useState<UploadFileResponse | null>(null);
  const { toast } = useToast();
  const {
    apiUrl,
    query,
    channelId,
    member,
    type: fileType,
    addOptimisticMessage,
  } = data as MessageFileModalData;

  const isModalOpen = isOpen && type === 'messageFile';

  const form = useForm({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      fileUrl: '',
    },
  });

  const handleClose = () => {
    form.reset();
    setFile(null);
    onClose();
  };

  const isLoading = form.formState.isSubmitting;

  const onDeleteImage = async (key: string) => {
    try {
      const query = new URLSearchParams({
        imageId: key,
      });
      await axios.delete(`/api/uploadthing?${query}`);
      setFile(null);
      form.resetField('fileUrl');
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        return console.error(err.response?.data);
      }
      console.error(err);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (addOptimisticMessage && channelId?.length && member) {
      const date = new Date();

      addOptimisticMessage({
        ...values,
        id: uuidv4(),
        createdAt: date,
        updatedAt: date,
        deleted: false,
        sent: false,
        channelId,
        member,
        memberId: member.id,
      });
    }

    handleClose();

    try {
      const params = new URLSearchParams({
        ...query,
      });

      await axios.post(`${apiUrl}?${params}`, values);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent
        className='dark:bg-zinc-900 border-2 border-teal-500 p-0 overflow-hidden'
        hideCloseButton
      >
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>
            Add an {fileType}
          </DialogTitle>

          <DialogDescription className='text-center text-muted-foreground'>
            Send a {fileType} as a message
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='flex flex-col space-y-8 items-center justify-center text-center'>
              <FormField
                control={form.control}
                name='fileUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      {!file && (
                        <UploadButton
                          endpoint={
                            fileType === 'image'
                              ? 'messageImage'
                              : fileType === 'video'
                              ? 'messageVideo'
                              : 'messagePdf'
                          }
                          onClientUploadComplete={(res) => {
                            const file = res?.at(0);
                            if (file) {
                              field.onChange(file);
                              setFile(file);
                            }
                          }}
                          onUploadError={(err) => {
                            console.error(err);
                            toast({
                              title: 'File Upload failed',
                              description: err.message,
                              variant: 'destructive',
                            });
                          }}
                        />
                      )}

                      {!!file &&
                        ['jpg', 'jpeg', 'png', 'webd'].includes(
                          getFileType(file.url) ?? ''
                        ) && (
                          <div className='relative h-20 w-20'>
                            <Image
                              fill
                              src={file.url}
                              alt='Upload'
                              className='rounded-md'
                            />
                            <Button
                              size='icon'
                              variant='destructive'
                              className='rounded-full absolute -top-1 -right-1 shadow-sm w-4 h-4'
                              type='button'
                              onClick={() => onDeleteImage(file.key)}
                            >
                              <X className='w-3 h-3' />
                            </Button>
                          </div>
                        )}
                      {!!file &&
                        ['mp4', 'flv', 'mov', 'ogg'].includes(
                          getFileType(file.url) ?? ''
                        ) && (
                          <div className='relative'>
                            <video className='h-20 w-20 rounded-sm' muted>
                              <source
                                src={file.url}
                                type={`video/${fileType}`}
                              ></source>
                            </video>

                            <Button
                              size='icon'
                              variant='destructive'
                              className='rounded-full absolute -top-1 -right-1 shadow-sm w-4 h-4'
                              type='button'
                              onClick={() => onDeleteImage(file.key)}
                            >
                              <X className='w-3 h-3' />
                            </Button>
                          </div>
                        )}

                      {!!file && getFileType(file.url) === 'pdf' && (
                        <div className='relative flex items-center p-2 mt-2 rounded-md bg-bakcground/10 bg-indigo-50'>
                          <FileIcon className='h-10 w-10 fill-indigo-200 stroke-indigo-400 ' />
                          <a
                            href={file.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='ml-2 text-start text-sm text-indigo-500 dark:text-indigo-400 hover:underline'
                          >
                            <Button
                              size='icon'
                              variant='destructive'
                              className='rounded-full absolute -top-2 -right-2 shadow-sm w-6 h-6'
                              type='button'
                              onClick={() => onDeleteImage(file.key)}
                            >
                              <X className='w-4 h-4' />
                            </Button>
                            {file.url}
                          </a>
                        </div>
                      )}

                      {!!file && getFileType(file.url) === 'pdf' && <></>}
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} type='text' />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className=' px-6 py-4'>
              <Button variant='ghost' type='button' onClick={handleClose}>
                Cancel
              </Button>
              <Button variant='primary' disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send'}
                {isLoading && <Loader2 className='w-4 h-4 ml-2 animate-spin' />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
