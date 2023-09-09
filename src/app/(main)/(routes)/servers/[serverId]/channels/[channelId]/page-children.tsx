import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MediaRoom } from '@/components/media-room';
import { MemberWithProfile } from '@/types';
import { Channel, ChannelType } from '@prisma/client';

export function ChannelIdPageChildren({
  channel,
  member,
}: {
  channel: Channel;
  member: MemberWithProfile;
}) {
  return (
    <>
      <ChatHeader
        serverId={channel.serverId}
        name={channel.name}
        type='channel'
      />

      {channel.type === ChannelType.TEXT && (
        <ChatMessages
          type='channel'
          currentMember={member}
          name={channel.name}
          chatId={channel.id}
          apiUrl='/api/messages'
          paramKey='channelId'
          paramValue={channel.id}
          socketUrl={'/api/socket/messages'}
          socketQuery={{
            channelId: channel.id,
            serverId: channel.serverId,
          }}
        />
      )}

      {channel.type === ChannelType.AUDIO && (
        <MediaRoom chatId={channel.id} audio={true} video={false} />
      )}

      {channel.type === ChannelType.VIDEO && (
        <MediaRoom chatId={channel.id} video={true} audio={false} />
      )}
    </>
  );
}
