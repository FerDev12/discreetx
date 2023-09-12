'use client';

import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { Input } from '@/components/ui/input';
import FileUpload from '@/components/server-file-upload';
import {
  EditServerModalData,
  useModalStore,
} from '@/hooks/stores/use-modal-store';
import { Server } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Sever name is required' }),
  files: z
    .array(
      z.object({
        name: z.string(),
        size: z.number(),
        url: z.string(),
        key: z.string(),
      })
    )
    .min(1, { message: 'Server image is required' }),
});

export default function EditServerModal() {
  const { isOpen, onClose, type, data } = useModalStore();
  const { server } = data as EditServerModalData;

  const form = useForm({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      files: [
        {
          name: '',
          key: '',
          url: '',
          size: 0,
        },
      ],
    },
  });

  useEffect(() => {
    if (server) {
      form.setValue('name', server.name);
      form.setValue('files', [
        {
          name: 'temp-name',
          size: 1234,
          url: server.imageUrl,
          key: 'temp-key',
        },
      ]);
    }
  }, [server, form]);

  const isModalOpen = isOpen && type === 'editServer';
  const isLoading = form.formState.isSubmitting;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch<Server>(`/api/socket/servers/${server?.id}`, {
        name: values.name,
        imageUrl: values.files.at(0)?.url,
      });

      form.reset();
      onClose();
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
      <DialogContent className=' dark:bg-zinc-900 border-2 border-teal-500 p-0 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold mb-2'>
            Edit your server
          </DialogTitle>

          <DialogDescription className='text-center text-muted-foreground'>
            Giver your server a personality with a name and an image. You can
            always change it later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='space-y-8 px-6'>
              <div className='flex items-center justify-center text-center'>
                <FormField
                  control={form.control}
                  name='files'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint='serverImage'
                          values={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='uppercase text-xs font-bold text-secondary-foreground/90'>
                      Server Name
                    </FormLabel>

                    <FormControl>
                      <Input
                        type='text'
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
                {!isLoading ? 'Save Changes' : 'Saving...'}
                {isLoading && <Loader2 className='w-4 h-4 ml-2 animate-spin' />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
