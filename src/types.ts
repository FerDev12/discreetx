import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Conversation, Member, Message, Profile, Server } from '@prisma/client';

export type ServerWithMembersWithConversations = Server & {
  members: Member[];
  conversations: (Conversation & {
    directMessages: { memberId: string }[];
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
  members: MemberWithSimpleProfile[];
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
