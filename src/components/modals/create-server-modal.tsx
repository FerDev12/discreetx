'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { createServer } from '@/actions/server/create';
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
import { ServerFileUpload } from '@/components/server-file-upload';
import { MemberFileUpload } from '@/components/member-file-upload';
import { useModalStore } from '@/hooks/stores/use-modal-store';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Sever name is required' }),
  fileUrl: z
    .string()
    .url('Value is not a valid url')
    .min(1, { message: 'Server image required' }),
  username: z.string().min(1, { message: 'Username is required' }),
  avatarUrl: z.string().url().min(1, { message: 'Avatar is requried' }),
});

export default function CreateServerModal() {
  const { isOpen, onClose, type } = useModalStore();
  const router = useRouter();

  const form = useForm({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      fileUrl: '',
      username: '',
      avatarUrl: '',
    },
  });

  const isModalOpen = isOpen && type === 'createServer';
  const isLoading = form.formState.isSubmitting;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('imageUrl', values.fileUrl);
      formData.append('username', values.username);
      formData.append('avatarUrl', values.avatarUrl);
      const server = await createServer(formData);

      if (!server) {
        throw new Error('Server not created');
      }

      if ('errors' in server) {
        return console.error(server.errors);
      }

      form.reset();
      router.refresh();
      router.push(`/servers/${server.id}`);
      onClose();
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className='dark:bg-zinc-900 border-2 border-teal-500  overflow-hidden'>
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
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='flex flex-col space-y-4 items-center'>
              <FormField
                control={form.control}
                name='fileUrl'
                render={({ field }) => (
                  <FormItem className='w-full flex items-center justify-center'>
                    <FormControl>
                      <ServerFileUpload
                        endpoint='serverImage'
                        fileUrl={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='w-full'>
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

              <div className='flex flex-col space-y-8 w-full'>
                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel>Username</FormLabel>

                      <FormControl>
                        <Input
                          type='text'
                          {...field}
                          autoComplete='off'
                          disabled={isLoading}
                          placeholder='How do you want to be called?'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='avatarUrl'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormControl>
                        <MemberFileUpload onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
