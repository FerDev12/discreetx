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
