import { MediaRoom } from '@/components/media-room';

type CallIdPageProps = {
  params: {
    chatId: string;
    memberId: string;
  };
};

export default function CallIdPage({
  params: { chatId, memberId },
}: CallIdPageProps) {
  return <MediaRoom chatId={chatId} video={true} audio={false} />;
}
