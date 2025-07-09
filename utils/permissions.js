import Sequelize from 'sequelize';

const createResolver = (resolver) => {
  const baseResolver = resolver;
  baseResolver.createResolver = (childResolver) => {
    const newResolver = async (parent, args, context, info) => {
      await resolver(parent, args, context, info);
      return childResolver(parent, args, context, info);
    };
    return createResolver(newResolver);
  };
  return baseResolver;
};

// TODO: Continue trying to figure out why this returns false for logged in user when meQuery is run on ViewTeam page.
// requiresAuth
export const requiresAuth = createResolver((parent, args, { user }) => {
  if (!user || !user.id) {
    throw new Error('Not authenticated');
  }
});

// requiresTeamAccess
export const requiresTeamAccess = createResolver(async (parent, { channelId }, { user, models }) => {
  if (!user || !user.id) {
    throw new Error('Not authenticated, team access.');
  }

  // Check if part of the team
  const channel = await models.Channel.findOne({ where: { id: channelId } });
  const member = await models.Member.findOne({
    where: { teamId: channel.teamId, user_id: user.id },
  });

  if (!member) {
    throw new Error(`You have to be a member of the team to subscribe to it's messages.`);
  }
});

// export const requiresTeamAccess = createResolver((parent, args, { user }) => {
//   console.log('requiresTeamAccess');
// });

// directMessage subscription
export const directMessageSubscription = createResolver(
  async (parent, { teamId, userId }, { user, models }) => {
    if (!user || !user.id) {
      throw new Error('Not authenticated, directmessages.');
    }

    const Op = Sequelize.Op;

    const members = await models.Member.findAll({
      where: {
        teamId,
        [Op.or]: [{ userId }, { userId: user.id }],
      },
    });

    if (members.length < 1) {
      throw new Error('Something went wrong');
    }
  },
);
