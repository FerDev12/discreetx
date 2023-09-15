'use client';

import { useEffect, useState } from 'react';

import CreateServerModal from '@/components/modals/create-server-modal';
import InviteModal from '@/components/modals/invite-modal';
import EditServerModal from '@/components/modals/edit-server-modal';
import MembersModal from '@/components/modals/manage-members-modal';
import CreateChannelModal from '@/components/modals/create-channel-modal';
import LeaveServerModal from '@/components/modals/leave-server-modal';
import DeleteServerModal from '@/components/modals/delete-server-modal';
import DeleteChannelModal from '@/components/modals/delete-channel-modal';
import EditChannelModal from '@/components/modals/edit-channel-modal';
import MessageFileModal from '@/components/modals/message-file-modal';
import DeleteMessageModal from '@/components/modals/delete-message-modal';
import CreateCallModal from '@/components/modals/create-call-modal';
import AnswerCallModal from '@/components/modals/answer-call-mdoal';
import CallEndedModal from '@/components/modals/call-ended-modal';
import { GenerateImageModal } from '../modals/generate-image-modal';

export function ModalProvider() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AnswerCallModal />
      <CreateCallModal />
      <CreateChannelModal />
      <CallEndedModal />
      <CreateServerModal />
      <DeleteChannelModal />
      <DeleteMessageModal />
      <DeleteServerModal />
      <EditChannelModal />
      <EditServerModal />
      <InviteModal />
      <MessageFileModal />
      <MembersModal />
      <LeaveServerModal />
      <GenerateImageModal />
    </>
  );
}
