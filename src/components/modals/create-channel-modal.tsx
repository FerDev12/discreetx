'use client';

import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
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
import {
  CreateChannelModalData,
  ModalType,
  useModalStore,
} from '@/hooks/stores/use-modal-store';
import { Channel, ChannelType, Server } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Channel name is required' })
    .refine((name) => name !== 'general', {
      message: "Channel name cannot be 'general'",
    }),
  type: z.nativeEnum(ChannelType),
});

export default function CreateChannelModal() {
  const router = useRouter();
  const { isOpen, onClose, type, data } = useModalStore();

  const { type: channelType, server } = data as CreateChannelModalData;

  useEffect(() => {
    (document.getElementById('name-input') as HTMLInputElement)?.focus();
  }, []);

  const form = useForm({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: channelType ?? ChannelType.TEXT,
    },
  });

  const isModalOpen = isOpen && type === ModalType.CREATE_CHANNEL;
  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (channelType) {
      form.setValue('type', channelType);
    } else {
      form.setValue('type', ChannelType.TEXT);
    }
  }, [channelType, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const query = new URLSearchParams({
        serverId: server.id,
      });

      const { data } = await axios.post<Channel>(
        `/api/socket/channels?${query}`,
        values
      );

      form.reset();
      router.refresh();
      router.push(`/servers/${server.id}/channels/${data.id}`);
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
      <DialogContent className='dark:bg-zinc-900 border-2 border-teal-500 p-0 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>
            Create Channel
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='space-y-8 px-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='uppercase text-xs font-bold text-secondary-foreground/90'>
                      Channel Name
                    </FormLabel>

                    <FormControl>
                      <Input
                        id='name-input'
                        type='text'
                        autoComplete='off'
                        disabled={isLoading}
                        className=''
                        placeholder='Enter channel name'
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='uppercase text-xs font-bold text-secondary-foreground/90'>
                      Channel type
                    </FormLabel>

                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a channel type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ChannelType).map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className='capitalize cursor-pointer'
                          >
                            {type.at(0) + type.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className='px-6 py-4 '>
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
