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
  params: { serverId, memberId },
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
    <section className='dark:bg-[#313338] flex flex-col h-svh'>
      <ChatHeader
        serverId={serverId}
        name={otherMember.profile.name}
        type='conversation'
        imageUrl={otherMember.profile.imageUrl}
      />

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
        socketUrl='/api/socket/direct-messages'
        socketQuery={{
          conversationId: conversation.id,
        }}
      />
    </section>
  );
}
