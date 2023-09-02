import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Member, Message, Profile, Server } from '@prisma/client';

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
