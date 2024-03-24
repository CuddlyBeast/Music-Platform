'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserInteraction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'userId' });
      this.belongsTo(models.Track, { foreignKey: 'trackId' });
    }
  }
  UserInteraction.init({
    userId: DataTypes.INTEGER,
    trackId: DataTypes.INTEGER,
    interactionType: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserInteraction',
  });
  return UserInteraction;
};