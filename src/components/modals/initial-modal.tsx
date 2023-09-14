'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { ServerFileUpload } from '@/components/server-file-upload';
import { zodResolver } from '@hookform/resolvers/zod';
import { createServer } from '@/actions/server/create';
import { MemberFileUpload } from '../member-file-upload';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Sever name is required' }),
  fileUrl: z
    .string()
    .url('Value is not a valid url')
    .min(1, { message: 'File url is required s' }),
  username: z.string().min(1, { message: 'Username is required' }),
  avatarUrl: z.string().url().min(1, { message: 'Avatar is requried' }),
});

export default function InitialModal() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setIsMounted(true), []);

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

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('imageUrl', values.fileUrl);
      formData.append('username', values.username);
      formData.append('avatarUrl', values.avatarUrl);
      await createServer(formData);

      form.reset();
      router.refresh();
      window.location.reload();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open>
      <DialogContent
        className='dark:bg-zinc-900 border-2 border-teal-500  overflow-hidden'
        hideCloseButton
      >
        <DialogHeader className='pt-8 px-6 mb-4'>
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
                    <FormLabel className='uppercase text-xs font-bold text-muted-foreground'>
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
                      <FormLabel className='uppercase text-xs font-bold text-muted-foreground'>
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='text'
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

            <DialogFooter className=' px-6 py-4'>
              <Button variant='primary' disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create'}
                {isLoading && <Loader2 className='w-4 h-4 ml-2 animate-spin' />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
