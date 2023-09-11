'use client';

import axios from 'axios';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';

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
import FileUpload from '@/components/file-upload';
import { Loader2 } from 'lucide-react';
import {
  MessageFileModalData,
  useModalStore,
} from '@/hooks/stores/use-modal-store';

const formSchema = z.object({
  // fileUrl: z.string().min(1, { message: 'File is required' }),
  // fileUrls: z.array(z.string().min(1, { message: 'File is required' })),
  fileUrls: z.array(
    z.object({
      name: z.string(),
      size: z.number(),
      url: z.string(),
      key: z.string(),
    })
  ),
});

export default function MessageFileModal() {
  const { isOpen, onClose, type, data } = useModalStore();
  const { apiUrl, query, channelId, member, addOptimisticMessages } =
    data as MessageFileModalData;

  const isModalOpen = isOpen && type === 'messageFile';

  const form = useForm({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      // fileUrl: '',
      fileUrls: [],
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (addOptimisticMessages && channelId?.length && member) {
      const date = new Date();

      addOptimisticMessages(
        values.fileUrls.map(({ url }) => ({
          id: uuidv4(),
          content: url,
          fileUrl: url,
          createdAt: date,
          updatedAt: date,
          deleted: false,
          sent: false,
          channelId,
          member,
          memberId: member.id,
        }))
      );
      // addOptimisticMessages([
      //   {
      //     id: uuidv4(),
      //     content: values.fileUrl,
      //     fileUrl: values.fileUrl,
      //     createdAt: date,
      //     updatedAt: date,
      //     deleted: false,
      //     sent: false,
      //     channelId,
      //     member,
      //     memberId: member.id,
      //   },
      // ]);
    }

    handleClose();

    try {
      const params = new URLSearchParams({
        ...query,
      });

      await Promise.all(
        values.fileUrls.map(
          async ({ url }) =>
            await axios.post(`${apiUrl}?${params}`, {
              fileUrl: url,
              content: url,
            })
        )
      );
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
            Add an attachment
          </DialogTitle>

          <DialogDescription className='text-center text-muted-foreground'>
            Send a file as a message
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='space-y-8 px-6'>
              <div className='flex items-center justify-center text-center'>
                <FormField
                  control={form.control}
                  name='fileUrls'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint='messageFile'
                          values={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
