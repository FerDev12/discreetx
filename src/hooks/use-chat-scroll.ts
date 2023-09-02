import { RefObject, useEffect, useState } from 'react';

type ChatScrollProps = {
  chatRef: RefObject<HTMLDivElement>;
  bottomRef: RefObject<HTMLDivElement>;
  shouldLoadMore: boolean;
  loadMore: () => void;
  count: number;
};

export function useChatScroll({
  chatRef,
  bottomRef,
  shouldLoadMore,
  loadMore,
  count,
}: ChatScrollProps) {
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const topDiv = chatRef?.current;

    const handleScroll = () => {
      const scrollTop = topDiv?.scrollTop;

      if (scrollTop === 0 && shouldLoadMore) {
        loadMore();

        // const firstChatItem = document.querySelector(
        //   '.chat-item'
        // ) as HTMLElement;
        // firstChatItem?.scrollIntoView({
        //   behavior: 'smooth',
        // });
      }
    };

    topDiv?.addEventListener('scroll', handleScroll);

    return () => topDiv?.removeEventListener('scroll', handleScroll);
  }, [chatRef, shouldLoadMore, loadMore]);

  useEffect(() => {
    const bottomDiv = bottomRef.current;
    const topDiv = chatRef.current;

    const shouldAutoScroll = () => {
      if (!hasInitialized && bottomDiv) {
        setHasInitialized(true);
        return true;
      }

      if (!topDiv) {
        return false;
      }

      const distanceFromBottom =
        topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;

      return distanceFromBottom <= 350;
    };

    if (shouldAutoScroll()) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [chatRef, bottomRef, hasInitialized, count]);
}
