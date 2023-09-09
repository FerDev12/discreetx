import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
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
};

export default async function MemberIdPage({
  params: { serverId, memberId: otherMemberId },
}: MemberIdPageProps) {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const server = await db.server.findFirst({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      members: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!server) {
    return redirect('/');
  }

  const currentMember = server.members.find(
    (member) => member.profileId === profile.id
  );

  if (!currentMember) {
    return redirect('/');
  }

  const conversation = await getOrCreateConversation(
    serverId,
    currentMember.id,
    otherMemberId
  );

  if (!conversation) {
    return redirect(`/server/${serverId}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember =
    memberOne.profileId === profile.id ? memberTwo : memberOne;

  const { calls } = conversation;
  const activeCall = calls?.at(0);

  return (
    <>
      <ChatHeader
        serverId={serverId}
        conversationId={conversation.id}
        name={otherMember.profile.name}
        type='conversation'
        imageUrl={otherMember.profile.imageUrl}
        currentMember={currentMember}
        otherMember={otherMember}
        callActive={activeCall?.active}
        callId={activeCall?.id}
        callType={activeCall?.type}
      />

      <ChatMessages
        type='conversation'
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
    </>
  );
}
