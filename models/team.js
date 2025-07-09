export const team = (sequelize, DataTypes) => {
  const Team = sequelize.define('team', {
    uuid: DataTypes.STRING,
    name: {
      type: DataTypes.STRING,
    },
    owner: DataTypes.INTEGER,
  });

  Team.associate = (models) => {
    Team.belongsToMany(models.User, {
      through: 'member',
      foreignKey: {
        name: 'teamId',
        field: 'team_id',
      },
    });
  };

  return Team;
};
