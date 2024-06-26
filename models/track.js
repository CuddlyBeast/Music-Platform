'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Track extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.Playlist, {
        through: 'PlaylistTrack',
        foreignKey: 'spotifyId',
        as: 'playlists'
      });
    }
  }
  Track.init({
    spotifyId: DataTypes.STRING,
    title: DataTypes.STRING,
    artist: DataTypes.STRING,
    album: DataTypes.STRING,
    durationMs: DataTypes.INTEGER,
    releaseDate: DataTypes.DATE,
    image: DataTypes.STRING,
    uri: DataTypes.STRING
  }, {
    sequelize,
    tableName: 'tracks',
    modelName: 'Track',
  });
  return Track;
};