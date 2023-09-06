'use client';

import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
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
import FileUpload from '@/components/file-upload';
import { useModalStore } from '@/hooks/use-modal-store';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Sever name is required' }),
  imageUrl: z.string().min(1, { message: 'Server image is required' }),
});

export default function CreateServerModal() {
  const { isOpen, onClose, type } = useModalStore();
  const router = useRouter();

  const form = useForm({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
    },
  });

  const isModalOpen = isOpen && type === 'createServer';
  const isLoading = form.formState.isSubmitting;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // const onSubmit = async (values: z.infer<typeof formSchema>) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append('name', values.name);
  //     formData.append('imageUrl', values.imageUrl);
  //     const server = await createServer(formData);

  //     if (!server) {
  //       throw new Error('Server not created');
  //     }

  //     form.reset();
  //     router.refresh();
  //     router.push(`/servers/${server.id}`);
  //     onClose();
  //   } catch (err: any) {
  //     console.error(err);
  //   }
  // };
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      //   const formData = new FormData();
      // formData.append('name', values.name);
      // formData.append('imageUrl', values.imageUrl);
      // const server = await createServer(formData);
      const { data: server } = await axios.post(`/api/servers`, values);

      if (!server) {
        throw new Error('Server not created');
      }

      form.reset();
      router.refresh();
      router.push(`/servers/${server.id}`);
      onClose();
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className='dark:bg-zinc-900 border-2 border-teal-500 p-0 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>
            Customize your server
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
                  name='imageUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint='serverImage'
                          value={field.value}
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
                {!isLoading ? 'Create' : 'Creating...'}
                {isLoading && <Loader2 className='w-4 h-4 ml-2 animate-spin' />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
