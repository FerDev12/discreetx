'use client';

import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import * as z from 'zod';

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
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  MessageFileModalData,
  useModalStore,
} from '@/hooks/stores/use-modal-store';
import { Input } from '@/components/ui/input';
import { MessageFileUpload } from '../message-file-upload';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  content: z.string(),
  fileUrl: z.string().url().nonempty(),
});

export default function MessageFileModal() {
  const { isOpen, onClose, type, data } = useModalStore();
  const {
    apiUrl,
    query,
    channelId,
    member,
    type: fileType,
    addOptimisticMessage,
  } = data as MessageFileModalData;

  const endpoint =
    fileType === 'image'
      ? 'messageImage'
      : fileType === 'video'
      ? 'messageVideo'
      : 'messagePdf';

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
    onClose();
  };

  const isLoading = form.formState.isSubmitting;

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

    try {
      const params = new URLSearchParams({
        ...query,
      });

      await axios.post(`${apiUrl}?${params}`, values);

      handleClose();
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
        className='dark:bg-zinc-900 border-2 border-teal-500  overflow-hidden'
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
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='fileUrl'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    {/* <MessageFileUpload
                        endpoint={endpoint}
                        fileUrl={field.value}
                        onChange={field.onChange}
                      /> */}
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
                    <Textarea {...field} disabled={isLoading} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className=' px-6 py-4'>
              <Button
                variant='ghost'
                type='button'
                disabled={isLoading}
                onClick={handleClose}
              >
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
