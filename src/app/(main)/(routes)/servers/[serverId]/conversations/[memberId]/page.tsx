import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { getOrCreateConversation } from '@/lib/conversation';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

type MemberIdPageProps = {
  params: {
    serverId: string;
    memberId: string;
  };
};

export async function generateMetadata({
  params,
}: MemberIdPageProps): Promise<Metadata> {
  const member = await db.member.findUnique({
    where: {
      id: params.memberId,
      serverId: params.serverId,
    },
    select: {
      profile: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    title: `${member?.profile?.name ?? 'Conversation'}`,
  };
}

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
      members: true,
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
    return redirect(`/servers/${serverId}`);
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
        name={otherMember.username}
        type='conversation'
        imageUrl={otherMember.avatarUrl}
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
        name={otherMember.username}
        chatId={conversation.id}
        apiUrl='/api/direct-messages'
        paramKey='conversationId'
        paramValue={conversation.id}
        socketUrl={'/api/socket/direct-messages'}
        socketQuery={{
          serverId: server.id,
          conversationId: conversation.id,
          memberId: currentMember.id,
        }}
      />
    </>
  );
}
