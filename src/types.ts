import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import {
  Conversation,
  DirectMessage,
  Member,
  Message,
  Profile,
  Server,
} from '@prisma/client';

export type ServerWithMembersWithConversations = Server & {
  members: MemberWithSimpleProfile[];
  conversations: (Conversation & {
    directMessages: (DirectMessage & { member: MemberWithSimpleProfile })[];
  })[];
};

export type MemberWithSimpleProfile = Member & {
  profile: {
    id: string;
    name: string;
    imageUrl: string;
  };
};

export type MemberWithProfile = Member & {
  read?: boolean;
  profile: Profile;
};

export type ServerWithMembersWithProfiles = Server & {
  members: MemberWithProfile[];
};

export type MessageWithMemberWithProfile = Message & {
  read?: boolean;
  member: MemberWithProfile;
};

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};
