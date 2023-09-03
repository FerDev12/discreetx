import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MediaRoom } from '@/components/media-room';
import { getOrCreateConversation } from '@/lib/conversation';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

type MemberIdPageProps = {
  params: {
    serverId: string;
    memberId: string;
  };
  searchParams: {
    video?: 'true' | 'false';
  };
};

export default async function MemberIdPage({
  params: { serverId, memberId },
  searchParams,
}: MemberIdPageProps) {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const currentMember = await db.member.findFirst({
    where: {
      serverId: serverId,
      profileId: profile.id,
    },
    include: {
      profile: true,
    },
  });

  if (!currentMember) {
    return redirect('/');
  }

  const conversation = await getOrCreateConversation(
    currentMember.id,
    memberId
  );

  if (!conversation) {
    return redirect(`/server/${serverId}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember =
    memberOne.profileId === profile.id ? memberTwo : memberOne;

  return (
    <>
      <ChatHeader
        serverId={serverId}
        name={otherMember.profile.name}
        type='conversation'
        imageUrl={otherMember.profile.imageUrl}
      />

      {searchParams.video && searchParams.video === 'true' && (
        <MediaRoom chatId={conversation.id} video={true} audio={false} />
      )}

      {(!searchParams.video || searchParams.video === 'false') && (
        <ChatMessages
          type='conversation'
          profile={profile}
          currentMember={currentMember}
          otherMember={otherMember}
          name={otherMember.profile.name}
          chatId={conversation.id}
          apiUrl='/api/direct-messages'
          paramKey='conversationId'
          paramValue={conversation.id}
          socketUrl={'/api/socket/direct-messages'}
          socketQuery={{
            conversationId: conversation.id,
          }}
        />
      )}
    </>
  );
}
