'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PlaylistTrack extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Playlist, { foreignKey: 'playlistId' });
      this.belongsTo(models.Track, { foreignKey: 'trackId' });
    }
  }
  PlaylistTrack.init({
    playlistId: DataTypes.INTEGER,
    trackId: DataTypes.INTEGER,
    addedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'PlaylistTrack',
  });
  return PlaylistTrack;
};