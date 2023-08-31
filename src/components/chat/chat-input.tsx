'use client';

import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { Plus, Smile } from 'lucide-react';
import { Input } from '../ui/input';
import axios from 'axios';

type ChatInputProps = {
  apiUrl: string;
  query: Record<string, any>;
  name: string;
  type: 'channel' | 'conversation';
};

const formSchema = z.object({
  content: z.string().min(1),
});

export function ChatInput({ apiUrl, query, name, type }: ChatInputProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    // @ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values: z.infer<typeof formSchema>) => {
    try {
      const params = new URLSearchParams({
        ...query,
      });

      await axios.post(`${apiUrl}?${params}`, values);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name='content'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className='relative p-4 pb-6 bg-zinc-800'>
                  <button className='absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center'>
                    <Plus className='text-zinc-50 dark:text-[#313338]' />
                  </button>

                  <Input
                    {...field}
                    placeholder={`Message ${
                      type === 'conversation' ? name : `#${name}`
                    }`}
                    disabled={isSubmitting}
                    className='px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-400'
                  />

                  <div className='absolute top-7 right-8'>
                    <Smile />
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
