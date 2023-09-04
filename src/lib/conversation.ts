import { db } from './db';

export const getOrCreateConversation = async (
  serverId: string,
  memberOneId: string,
  memberTwoId: string
) => {
  let conversation =
    (await findConversation(memberOneId, memberTwoId)) ??
    (await findConversation(memberTwoId, memberOneId));

  if (!conversation) {
    conversation = await createNewConversation(
      serverId,
      memberOneId,
      memberTwoId
    );
  }

  return conversation;
};

export const findConversation = async (
  memberOneId: string,
  memberTwoId: string
) => {
  return await db.conversation.findFirst({
    where: {
      AND: [{ memberOneId: memberOneId }, { memberTwoId: memberTwoId }],
    },
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
      calls: {
        where: {
          active: true,
          ended: false,
        },
      },
    },
  });
};

export const createNewConversation = async (
  serverId: string,
  memberOneId: string,
  memberTwoId: string
) => {
  try {
    return await db.conversation.create({
      data: {
        serverId,
        memberOneId,
        memberTwoId,
      },
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
        calls: {
          where: {
            active: true,
            ended: false,
          },
        },
      },
    });
  } catch (err: any) {
    return null;
  }
};
