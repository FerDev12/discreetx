import {
  MemberWithProfile,
  MessageWithMemberWithProfile,
  ServerWithMembersWithProfiles,
} from '@/types';
import {
  CallType,
  Channel,
  ChannelType,
  Member,
  Message,
  Server,
} from '@prisma/client';
import { create } from 'zustand';

export enum ModalType {
  CREATE_SERVER = 'createServer',
  INVITE = 'invite',
  EDIT_SERVER = 'editServer',
  MANAGE_MEMBERS = 'manageMembers',
  CREATE_CHANNEL = 'createChannel',
  LEAVE_SERVER = 'leaveServer',
  DELETE_SERVER = 'deleteServer',
  DELETE_CHANNEL = 'deleteChannel',
  EDIT_CHANNEL = 'editChannel',
  MESSAGE_FILE = 'messageFile',
  DELETE_MESSAGE = 'deleteMessage',
  CREATE_CALL = 'createCall',
  ANSWER_CALL = 'answerCall',
  CALL_ENDED = 'callEnded',
  GENERATE_IMAGE = 'generateImage',
}

interface CreateServerMdoalData {}
export interface EditServerModalData {
  server: Server;
}
export interface DeleteServerModalData {
  server: Server;
}
export interface LeaveServerModalData {
  server: Server;
}
export interface CreateChannelModalData {
  type?: ChannelType;
  server: ServerWithMembersWithProfiles;
}
export interface EditChannelModalData {
  server: Server;
  channel: Channel;
}
export interface DeleteChannelModalData {
  channel: Channel;
  server: Server;
}
export interface CreateCallModalData {
  serverId: string;
  conversationId: string;
  name: string;
  type: CallType;
}
export interface AnswerCallModalData {
  callId: string;
  conversationId: string;
  type: CallType;
  from: {
    id: string;
    name: string;
    imageUrl: string;
  };
}
export interface CallEndedAlertModalData {
  serverId: string;
  conversationId: string;
}
export interface InviteModalData {
  server: Server;
}
export interface ManageMembersModalData {
  server: ServerWithMembersWithProfiles;
}
export interface DeleteMessageModalData {
  apiUrl: string;
  query: Record<string, string>;
  messageId: string;
  deleteOptimisticMessage: (messageId: string) => void;
}
export interface MessageFileModalData {
  type: 'image' | 'video' | 'pdf';
  apiUrl: string;
  query: Record<string, string>;
  channelId: string;
  member: Member;
  addOptimisticMessage: (message: Message & { member: Member }) => void;
}

export interface GenerateImageModalData {
  apiUrl: string;
  query: Record<string, string>;
  channelId: string;
  member: Member;
  addOptimisticMessage: (message: Message & { member: Member }) => void;
}

type ModalDataType =
  | { type: null; data: {} }
  | { type: ModalType.CREATE_SERVER; data: {} }
  | { type: ModalType.EDIT_SERVER; data: EditServerModalData }
  | { type: ModalType.DELETE_SERVER; data: DeleteServerModalData }
  | { type: ModalType.CREATE_CHANNEL; data: CreateChannelModalData }
  | { type: ModalType.LEAVE_SERVER; data: LeaveServerModalData }
  | { type: ModalType.EDIT_CHANNEL; data: EditChannelModalData }
  | { type: ModalType.DELETE_CHANNEL; data: DeleteChannelModalData }
  | { type: ModalType.CREATE_CALL; data: CreateCallModalData }
  | { type: ModalType.ANSWER_CALL; data: AnswerCallModalData }
  | { type: ModalType.CALL_ENDED; data: CallEndedAlertModalData }
  | { type: ModalType.MANAGE_MEMBERS; data: ManageMembersModalData }
  | { type: ModalType.INVITE; data: InviteModalData }
  | { type: ModalType.DELETE_MESSAGE; data: DeleteMessageModalData }
  | { type: ModalType.MESSAGE_FILE; data: MessageFileModalData }
  | { type: ModalType.GENERATE_IMAGE; data: GenerateImageModalData };

export type ModalStore = {
  isOpen: boolean;
  onOpen: (args: ModalDataType) => void;
  onClose: () => void;
} & ModalDataType;

export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (args) =>
    // @ts-ignore
    set({
      isOpen: true,
      type: args.type,
      data:
        args.type !== ModalType.CREATE_SERVER && args.type !== null
          ? args.data
          : {},
    }),
  onClose: () => set({ isOpen: false, type: null }),
}));
