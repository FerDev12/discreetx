'use client';

import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
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
import { useModalStore } from '@/hooks/use-modal-store';
import { ChannelType, Server } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useEffect } from 'react';

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
  const {
    isOpen,
    onClose,
    type,
    data: { channel, server },
  } = useModalStore();

  useEffect(() => {
    (document.getElementById('name-input') as HTMLInputElement)?.focus();
  }, []);

  const form = useForm({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: channel?.name ?? '',
      type: channel?.type ?? ChannelType.TEXT,
    },
  });

  useEffect(() => {
    if (channel) {
      form.setValue('type', channel.type);
      form.setValue('name', channel.name);
    } else {
      form.setValue('type', ChannelType.TEXT);
      form.setValue('name', '');
    }
  }, [channel, form]);

  const isModalOpen = isOpen && type === 'editChannel';
  const isLoading = form.formState.isSubmitting;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const query = new URLSearchParams({
        serverId: server?.id ?? '',
      });

      const { data } = await axios.patch<Server>(
        `/api/channels/${channel?.id}?${query}`,
        values
      );

      form.reset();
      router.refresh();
      router.push(`/servers/${data.id}`);
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
      <DialogContent className='bg-gradient-to-br border-2 border-teal-500 p-0 overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>
            Edit Channel
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
                        type='text'
                        autoComplete='off'
                        id='name-input'
                        disabled={isLoading}
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
