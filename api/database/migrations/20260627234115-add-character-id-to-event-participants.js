'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('event_participants', 'character_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'characters',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // We also need to remove the old unique constraint and add the new one.
    // The old index name is 'unique_event_participant'
    await queryInterface.removeIndex('event_participants', 'unique_event_participant');

    await queryInterface.addIndex('event_participants', {
      fields: ['event_id', 'character_id'],
      unique: true,
      name: 'unique_event_participant',
      where: { deletedAt: null }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('event_participants', 'unique_event_participant');

    await queryInterface.addIndex('event_participants', {
      fields: ['event_id', 'character_version_id'],
      unique: true,
      name: 'unique_event_participant',
      where: { deletedAt: null }
    });

    await queryInterface.removeColumn('event_participants', 'character_id');
  }
};
