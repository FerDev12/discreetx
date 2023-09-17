'use client';

import {
  GenerateImageModalData,
  ModalType,
  useModalStore,
} from '@/hooks/stores/use-modal-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Textarea } from '../ui/textarea';
import axios from 'axios';
import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon, Loader2, X } from 'lucide-react';
import { randomBytes } from 'crypto';

const urlSchema = z.string().url();

const isUrl = (value: string) => urlSchema.safeParse(value).success;

const formSchema = z.object({
  prompt: z.string().min(1, { message: 'Description is required' }),
});

type FormSchema = z.infer<typeof formSchema>;

export function GenerateImageModal() {
  const { type, isOpen, onClose, data } = useModalStore();
  const [url, setUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  const form = useForm<FormSchema>({
    defaultValues: {
      // @ts-ignore
      resolver: zodResolver(formSchema),
      prompt: 'Draw a picture of a small cow on a sunny day.',
    },
  });

  const { apiUrl, query, member, channelId, addOptimisticMessage } =
    data as GenerateImageModalData;

  const handleClose = () => {
    onClose();
    setUrl('');
    form.reset();
  };

  const onGenerate = async (values: FormSchema) => {
    try {
      // Take description and call endpoint
      const {
        data: { imageUrl },
      } = await axios.post('/api/openai/generate-image', values);

      setUrl(imageUrl);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        return console.error(err.response?.data);
      }
      console.error(err);
    }
  };

  const onSend = async () => {
    if (!url.length) return;
    if (!isUrl(url)) return;

    try {
      setIsSending(true);
      const date = new Date();

      addOptimisticMessage({
        id: randomBytes(8).toString('hex'),
        content: url,
        fileUrl: url,
        member,
        channelId,
        deleted: false,
        memberId: member.id,
        sent: false,
        createdAt: date,
        updatedAt: date,
      });

      const params = new URLSearchParams({
        ...query,
      });

      await axios.post(`${apiUrl}?${params}`, {
        content: url,
        fileUrl: url,
      });

      handleClose();
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        return console.error(err.response?.data);
      }
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const isLoading = form.formState.isSubmitting || isSending;

  const open = isOpen && type === ModalType.GENERATE_IMAGE;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='dark:bg-zinc-900 border-2 border-teal-500 p-0 overflow-hidden'>
        <DialogHeader className='pt-8 px-6 flex flex-col items-center space-y-4'>
          <ImageIcon className='w-10 h-10 text-rose-400 text-center' />
          <div className='flex flex-col items-center space-y-2'>
            <DialogTitle className='text-center'>Generate Image</DialogTitle>
            <DialogDescription className='text-center'>
              Describe your image as best as you can 😊
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className='flex items-center justify-center text-center w-full px-6'>
          {url.length === 0 ? (
            <Form {...form}>
              <form
                id='generate-image-form'
                className='w-full'
                onSubmit={form.handleSubmit(onGenerate)}
              >
                <FormField
                  control={form.control}
                  name='prompt'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormControl>
                        <Textarea
                          disabled={isLoading}
                          className='w-full'
                          {...field}
                        ></Textarea>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          ) : (
            <div className='relative'>
              <div className='aspect-square h-64 relative rounded-sm overflow-hidden'>
                <Image
                  src={url}
                  alt={form.getValues('prompt') ?? 'AI generated image'}
                  fill
                />
              </div>
              <button
                className='absolute -top-1 -right-1 z-10 p-1 rounded-full bg-rose-500'
                onClick={() => {
                  setUrl('');
                }}
              >
                <X className='w-3 h-3 rounded-full' />
              </button>
            </div>
          )}
        </div>

        <DialogFooter className='flex flex-col-reverse gap-y-2 px-6 py-4'>
          <Button variant='ghost' type='button' onClick={handleClose}>
            Cancel
          </Button>
          {url.length === 0 ? (
            <Button type='submit' form='generate-image-form' variant='primary'>
              {isLoading && <Loader2 className='w-4 h-4 animate-spin mr-2' />}
              {isLoading ? 'Generating...' : 'Generate!'}
            </Button>
          ) : (
            <Button variant='primary' type='button' onClick={onSend}>
              {isLoading ? 'Sending...' : 'Send'}
              {isLoading && <Loader2 className='w-4 h-4 animate-spin' />}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
