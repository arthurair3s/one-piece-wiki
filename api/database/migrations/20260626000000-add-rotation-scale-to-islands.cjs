'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('islands');
    if (!tableInfo.rotation_y) {
      await queryInterface.addColumn('islands', 'rotation_y', {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: -180.0,
      });
    }
    if (!tableInfo.scale) {
      await queryInterface.addColumn('islands', 'scale', {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 1.0,
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('islands', 'rotation_y');
    await queryInterface.removeColumn('islands', 'scale');
  },
};
