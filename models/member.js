export const member = (sequelize, DataTypes) => {
  const Member = sequelize.define('member', {
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return Member;
};
