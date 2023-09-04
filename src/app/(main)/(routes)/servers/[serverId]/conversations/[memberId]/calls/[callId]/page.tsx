import { ChatHeader } from '@/components/chat/chat-header';
import { MediaRoom } from '@/components/media-room';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

type CallIdPageProps = {
  params: {
    callId: string;
    memberId: string;
    serverId: string;
  };
};

export default async function CallIdPage({
  params: { callId, memberId, serverId },
}: CallIdPageProps) {
  const profile = await currentProfile();

  if (!profile) return redirectToSignIn();

  const call = await db.call.findUnique({
    where: {
      id: callId,
      conversation: {
        OR: [
          { memberOne: { profileId: profile.id } },
          { memberTwo: { profileId: profile.id } },
        ],
      },
    },
    include: {
      conversation: {
        include: {
          memberOne: {
            include: {
              profile: true,
            },
          },
          memberTwo: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
  });

  if (!call) {
    return redirect('/');
  }

  if (!call.active) {
    return redirect('/');
  }

  const currentMember =
    call.conversation.memberOne.profileId === profile.id
      ? call.conversation.memberOne
      : call.conversation.memberTwo;
  const otherMember =
    call.conversation.memberOne.profileId !== profile.id
      ? call.conversation.memberOne
      : call.conversation.memberTwo;

  return (
    <>
      <ChatHeader
        conversationId={call.conversationId}
        type='conversation'
        currentMember={currentMember}
        otherMember={otherMember}
        serverId={serverId}
        name={otherMember.profile.name}
        imageUrl={otherMember.profile.imageUrl}
      />
      <div className='max-h-[calc(100svh-64px)]'>
        <MediaRoom
          chatId={call.id}
          video={call.type === 'VIDEO'}
          audio={call.type === 'AUDIO'}
        />
      </div>
    </>
  );
}
