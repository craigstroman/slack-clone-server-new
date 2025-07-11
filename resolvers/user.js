import { tryLogin } from '../utils/auth.js';
import { formatErrors } from '../utils/formatErrors.js';
import { requiresAuth } from '../utils/permissions.js';
import shortid from 'shortid';

export const userResolver = {
  User: {
    /**
     * Get's the teams.
     *
     * @param      {Object}  parent       The parent.
     * @param      {Object}  args         The arguments.
     * @param      {Object}  models       The models.
     * @param      {Object}  user         The user.
     */
    teams: (parent, args, { models, user }) =>
      models.sequelize.query(
        'select * from teams as team join members as member on team.id = member.team_id where member.user_id = ?',
        {
          replacements: [user.id],
          model: models.Team,
          raw: true,
        },
      ),
  },
  Query: {
    /**
     * Get's all users.
     *
     * @param      {Object}  parent       The parent.
     * @param      {Object}  args         The arguments.
     * @param      {Object}  models       The models.
     */
    allUsers: (parent, args, { models }) => models.User.findAll(),
    /**
     * Get's a users profile by username.
     *
     * @param      {Object}  parent       The parent.
     * @param      {Object}  args         The arguments.
     * @param      {Object}  user         The user.
     * @param      {Object}  models       The models.
     */

    getUserByName: requiresAuth.createResolver((parent, args, { models }) => {
      const username = args.username;

      return models.User.findOne({ where: { username } });
    }),

    /**
     * Gets information for logged in user.
     *
     * @param      {Object}  parent       The parent.
     * @param      {Object}  args         The arguments.
     * @param      {Object}  models       The models.
     */
    me: requiresAuth.createResolver((parent, args, { user, models }) =>
      models.User.findOne({ where: { id: user.id } }),
    ),

    /**
     * Checks if a users email already exists.
     *
     * @param      {Object}  parent       The parent.
     * @param      {Object}  args         The arguments.
     * @param      {Object}  models       The models.
     */
    verifyEmail: async (parent, args, { models }) => {
      try {
        const { email } = args;
        const result = await models.User.findOne({ where: { email: email } }, { raw: true });

        if (result !== null) {
          if (email === result.email) {
            return true;
          }
        }

        return false;
      } catch (err) {
        console.log(`There was an error: ${err}`);

        return false;
      }
    },

    /**
     * Verify's if a user exists or not.
     *
     * @param      {Object}   parent       The parent
     * @param      {Object}   args         The arguments
     * @param      {Object}   models       The models
     * @return     {boolean}  { description_of_the_return_value }
     */
    verifyUser: async (parent, args, { models }) => {
      try {
        const { username } = args;
        const result = await models.User.findOne({ where: { username: username } }, { raw: true });

        if (result !== null) {
          if (username === result.username) {
            return true;
          }
        }

        return false;
      } catch (err) {
        console.log(`There was an error: ${err}`);

        return false;
      }
    },
  },
  Mutation: {
    /**
     * Logs a user in.
     *
     * @param      {Object}  parent         The parent
     * @param      {String}  email          The email.
     * @param      {String}  password       The password.
     * @param      {Object}  models         The models.
     * @param      {String}  SECRET         The secret.
     * @param      {String}  SECRET2        The secret 2.
     */
    login: async (parent, { email, password }, { models, SECRET1, SECRET2 }) => {
      const loginResult = await tryLogin(email, password, models, SECRET1, SECRET2);
      let result = null;
      let teams = null;
      let team = null;
      let channelUUID = null;

      if (loginResult.ok) {
        try {
          teams = await models.sequelize.query(
            'select * from teams as team join members as member on team.id = member.team_id where member.user_id = ?',
            {
              replacements: [loginResult.userInfo.id],
              model: models.Team,
              raw: true,
            },
          );

          team = teams[0];

          if (team !== undefined) {
            const channel = await models.sequelize.query(
              "select uuid from channels where channels.name = 'general' and channels.team_id = ?",
              {
                replacements: [team.id],
                model: models.Channels,
                raw: true,
              },
            );

            channelUUID = channel[0][0].uuid;
          } else {
            console.log('No teams.');
            teams = [];
            team = '';
            channelUUID = '';
          }
        } catch (err) {
          console.log(`There was an error: ${err}`);

          teams = [];
          team = '';
          channelUUID = '';
        }

        if (Array.isArray(teams)) {
          if (teams.length >= 1) {
            result = {
              ok: loginResult.ok,
              user: loginResult.user,
              teamUUID: team.uuid,
              channelUUID: channelUUID,
              token: loginResult.token,
              refreshToken: loginResult.refreshToken,
            };
          } else {
            result = {
              ok: loginResult.ok,
              user: loginResult.user,
              teamUUID: undefined,
              token: loginResult.token,
              refreshToken: loginResult.refreshToken,
            };
          }
        } else {
          result = {
            ok: loginResult.ok,
            user: loginResult.user,
            teamUUID: undefined,
            token: loginResult.token,
            refreshToken: loginResult.refreshToken,
          };
        }
      } else {
        result = {
          ok: loginResult.ok,
          user: loginResult.user,
          teamUUID: undefined,
          token: loginResult.token,
          refreshToken: loginResult.refreshToken,
        };
      }

      return result;
    },
    /**
     * Registers a user.
     *
     * @param      {Object}  parent       The parent.
     * @param      {Object}  args         The arguments.
     * @param      {Object}  models       The models.
     */
    register: async (parent, args, { models }) => {
      try {
        args['uuid'] = shortid.generate();

        const user = await models.User.create(args);

        return {
          ok: true,
          user,
        };
      } catch (err) {
        return {
          ok: false,
          errors: formatErrors(err, models),
        };
      }
    },
    updateProfile: async (parent, args, { models }) => {
      const { id, username, firstName, lastName, phoneNumber } = args;

      try {
        await models.sequelize.query(
          'update users set username = ?, first_name = ?, last_name = ?, phone_number = ? where id = ?',
          {
            replacements: [username, firstName, lastName, phoneNumber, id],
            model: models.User,
            raw: true,
          },
        );

        return {
          ok: true,
        };
      } catch (err) {
        return {
          ok: false,
          errors: formatErrors(err, models),
        };
      }
    },
  },
};
