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
import { ImageIcon, Loader2 } from 'lucide-react';
import { randomBytes } from 'crypto';

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
    try {
      const params = new URLSearchParams({
        ...query,
      });
      setIsSending(true);
      const date = new Date();
      addOptimisticMessage({
        id: randomBytes(8).toString('hex'),
        content: url,
        fileUrl: url,
        member,
        channelId: channelId ? channelId : randomBytes(8).toString('hex'),
        deleted: false,
        memberId: member.id,
        sent: false,
        createdAt: date,
        updatedAt: date,
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
      <DialogContent>
        <DialogHeader className='text-center'>
          <ImageIcon className='w-6 h-6 text-rose-400' />
          <DialogTitle>Generate Image</DialogTitle>
          <DialogDescription>
            Describe your image as best as you can 😊
          </DialogDescription>
        </DialogHeader>

        <div className='flex items-center justify-center text-center'>
          {url.length === 0 ? (
            <Form {...form}>
              <form
                id='generate-image-form'
                onSubmit={form.handleSubmit(onGenerate)}
              >
                <FormField
                  name='prompt'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea {...field}></Textarea>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          ) : (
            <div className='w-48 h-48 relative rounded-sm'>
              <Image
                src={url}
                alt={form.getValues('prompt') ?? 'AI generated image'}
                fill
                className='rounded-sm'
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='ghost' type='button' onClick={handleClose}>
            Cancel
          </Button>
          {url.length === 0 ? (
            <Button type='submit' form='generate-image-form' variant='primary'>
              {isLoading ? 'Generating...' : 'Generate!'}
              {isLoading && <Loader2 className='w-4 h-4 animate-spin' />}
              Generate!
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
