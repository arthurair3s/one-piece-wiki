'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('IslandCharacterVersions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      island_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      character_version_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CharacterVersions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Para evitar registros duplicados do mesmo personagem na mesma ilha
    await queryInterface.addConstraint('IslandCharacterVersions', {
      fields: ['island_id', 'character_version_id'],
      type: 'unique',
      name: 'unique_island_character_version'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('IslandCharacterVersions');
  }
};
