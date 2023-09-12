'use client';

import { Camera, FileIcon, Film, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import * as z from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  ModalType,
  useModalStore,
} from '@/hooks/stores/use-modal-store';
import { MessageFileUpload } from '@/components/message-file-upload';
import { ReactNode } from 'react';
import { Textarea } from '@/components/ui/textarea';

const iconMap = new Map<'image' | 'video' | 'pdf', ReactNode>();
iconMap.set(
  'pdf',
  <FileIcon className='h-10 w-10 fill-indigo-200 stroke-indigo-400' />
);
iconMap.set(
  'image',
  <Camera className='h-10 w-10 fill-teal-200 stroke-teal-400' />
);
iconMap.set(
  'video',
  <Film className='h-10 w-10 fill-rose-200 stroke-rose-400' />
);

const formSchema = z.object({
  content: z.string(),
  fileUrl: z
    .string()
    .url('Value is not a valid url')
    .min(1, { message: 'Server image required' }),
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

  const form = useForm({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      fileUrl: '',
    },
  });

  const isModalOpen = isOpen && type === ModalType.MESSAGE_FILE;
  const isLoading = form.formState.isSubmitting;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let c = values.content.length > 0 ? values.content : values.fileUrl;
      if (channelId) {
        const date = new Date();
        addOptimisticMessage({
          id: uuidv4(),
          content: c,
          fileUrl: values.fileUrl,
          member,
          channelId,
          deleted: false,
          sent: false,
          memberId: member.id,
          createdAt: date,
          updatedAt: date,
        });
      }

      const params = new URLSearchParams({
        ...query,
      });
      await axios.post(`${apiUrl}?${params}`, {
        ...values,
        content: c,
      });
      handleClose();
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  };

  const isPdf = fileType === 'pdf';
  const isImage = fileType === 'image';
  const isVideo = fileType === 'video';

  return (
    <Dialog open={isModalOpen || isLoading} onOpenChange={handleClose}>
      <DialogContent className='dark:bg-zinc-900 border-2 border-teal-500 p-0 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <div className='flex items-center justify-center'>
            {isPdf && iconMap.get('pdf')}
            {isImage && iconMap.get('image')}
            {isVideo && iconMap.get('video')}
          </div>

          <DialogTitle className='text-2xl text-center font-bold'>
            {isPdf && 'Send a PDF file'}
            {isImage && 'Send an image'}
            {isVideo && 'Send a video'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='space-y-8 px-6'>
              <div className='flex items-center justify-center text-center'>
                <FormField
                  control={form.control}
                  name='fileUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MessageFileUpload
                          fileType={fileType}
                          onChange={field.onChange}
                          isLoading={isLoading}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='uppercase text-xs font-bold text-secondary-foreground/90'>
                      Attach a message to your {fileType}
                    </FormLabel>

                    <FormControl>
                      <Textarea
                        autoComplete='off'
                        disabled={isLoading}
                        placeholder='Enter server name'
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className='flex flex-col-reverse gap-y-2 px-6 py-4 '>
              <Button
                disabled={isLoading}
                type='button'
                variant='ghost'
                onClick={handleClose}
              >
                Cancel
              </Button>

              <Button type='submit' disabled={isLoading} variant='primary'>
                {!isLoading ? 'Send' : 'Sending...'}
                {isLoading && <Loader2 className='w-4 h-4 ml-2 animate-spin' />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
