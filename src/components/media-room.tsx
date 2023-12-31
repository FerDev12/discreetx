'use client';

import '@livekit/components-styles';
import { useUser } from '@clerk/nextjs';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type MediaRoomProps = {
  callId?: string;
  chatId: string;
  video: boolean;
  audio: boolean;
  username: string;
};

export function MediaRoom({
  chatId,
  video,
  audio,
  callId,
  username,
}: MediaRoomProps) {
  const router = useRouter();
  const [token, setToken] = useState('');

  useEffect(() => {
    // if (!user?.firstName || !user?.lastName) return;

    // const name = `${user.firstName} ${user.lastName}`;

    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=${chatId}&username=${username}`
        );
        const data = await resp.json();

        setToken(data.token);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [username, chatId]);

  const onDisconnect = async () => {
    if (!callId) return;
    try {
      const query = new URLSearchParams({
        conversationId: chatId,
        callId,
      });

      const { data: call } = await axios.delete(
        `/api/socket/calls/${callId}?${query}`
      );
      router.push(
        `/servers/${call.conversation.serverId}/conversations/${call.conversationId}`
      );
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      }
      {
        console.error(err);
      }
    }
  };

  if (token === '') {
    return (
      <div className='flex flex-col flex-1 justify-center items-center'>
        <Loader2 className='h-7 w-7 text-zinc-500 animate-spin my-4' />
        <p className='text-xs text-zinc-500 dark:text-zinc-400'>Loading...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme='default'
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
      connectOptions={{
        autoSubscribe: false,
      }}
      onConnected={() => {
        console.log('Connected');
      }}
      onDisconnected={onDisconnect}
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
