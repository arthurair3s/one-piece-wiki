'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. profiles
    await queryInterface.createTable('profiles', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('profiles', ['deletedAt']);

    // 2. permissions
    await queryInterface.createTable('permissions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('permissions', ['deletedAt']);

    // 3. profile_permissions (pivot)
    await queryInterface.createTable('profile_permissions', {
      profile_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'profiles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Aqui o cascade faz sentido, pois é só uma tabela de ligação
      },
      permission_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'permissions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('profile_permissions', ['deletedAt']);

    // 4. users
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: Sequelize.STRING, allowNull: false, unique: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      profile_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'profiles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // Protege o perfil de ser apagado se tiver usuários
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('users', ['deletedAt', 'profile_id']);

    // 5. sagas
    await queryInterface.createTable('sagas', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      order: { type: Sequelize.INTEGER, allowNull: false, unique: true }, // RN02: ordem única por saga
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('sagas', ['deletedAt']);

    // 6. arcs
    await queryInterface.createTable('arcs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      saga_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sagas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // RN01
      },
      order: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addConstraint('arcs', {
      fields: ['order', 'saga_id'],
      type: 'unique',
      name: 'unique_arc_order_per_saga'
    });
    await queryInterface.addIndex('arcs', ['deletedAt', 'saga_id']);

    // 7. islands
    await queryInterface.createTable('islands', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: false },
      coordinate_x: { type: Sequelize.FLOAT, allowNull: false },
      coordinate_y: { type: Sequelize.FLOAT, allowNull: false },
      coordinate_z: { type: Sequelize.FLOAT, allowNull: false },
      model_url: { type: Sequelize.STRING, allowNull: false },
      thumbnail_url: { type: Sequelize.STRING, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('islands', ['deletedAt']);

    // 8. arc_islands
    await queryInterface.createTable('arc_islands', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      arc_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'arcs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      island_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'islands', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addConstraint('arc_islands', {
      fields: ['arc_id', 'order'],
      type: 'unique',
      name: 'unique_arc_island_order' // RN09
    });
    await queryInterface.addIndex('arc_islands', ['deletedAt', 'arc_id', 'island_id']);

    // 9. events
    await queryInterface.createTable('events', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      island_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'islands', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      arc_id: { // Adicionado para contexto (RN09)
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'arcs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      type: { type: Sequelize.STRING, allowNull: false },
      order: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addConstraint('events', {
      fields: ['island_id', 'arc_id', 'order'],
      type: 'unique',
      name: 'unique_event_order_context' // RN03: ordem única por evento numa ilha num arco
    });
    await queryInterface.addIndex('events', ['deletedAt', 'island_id', 'arc_id']);

    // 10. characters
    await queryInterface.createTable('characters', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('characters', ['deletedAt']);

    // 11. character_versions
    await queryInterface.createTable('character_versions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      character_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'characters', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      alias: { type: Sequelize.STRING, allowNull: true },
      epithet: { type: Sequelize.STRING, allowNull: true },
      bounty: { type: Sequelize.BIGINT, allowNull: true },
      status: {
        type: Sequelize.ENUM('ALIVE', 'DECEASED', 'UNKNOWN', 'IMPRISONED'),
        allowNull: false,
        defaultValue: 'ALIVE',
      },
      image_url: { type: Sequelize.STRING, allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('character_versions', ['deletedAt', 'character_id']);

    // 11b. arc_character_versions
    await queryInterface.createTable('arc_character_versions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      arc_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'arcs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      character_version_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'character_versions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      character_id: { // Adicionado para garantir a RN04 (Desnormalização)
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'characters', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addConstraint('arc_character_versions', {
      fields: ['arc_id', 'character_id'],
      type: 'unique',
      name: 'unique_one_version_per_character_in_arc' // RN04 blindada
    });
    await queryInterface.addIndex('arc_character_versions', ['deletedAt', 'arc_id']);

    // 12. island_character_versions
    await queryInterface.createTable('island_character_versions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      island_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'islands', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      arc_id: { // Adicionado para contexto (Revisitas)
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'arcs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      character_version_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'character_versions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      order: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addConstraint('island_character_versions', {
      fields: ['island_id', 'arc_id', 'order'],
      type: 'unique',
      name: 'unique_island_arc_order_version'
    });
    await queryInterface.addIndex('island_character_versions', ['deletedAt']);

    // 13. event_participants
    await queryInterface.createTable('event_participants', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'events', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Participante sai se evento for deletado
      },
      character_version_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'character_versions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addConstraint('event_participants', {
      fields: ['event_id', 'character_version_id'],
      type: 'unique',
      name: 'unique_event_participant' // RN11
    });
    await queryInterface.addIndex('event_participants', ['deletedAt']);
  },

  down: async (queryInterface, Sequelize) => {
    // A ordem do drop table deve ser exatamente a inversa da criação para não quebrar FKs
    await queryInterface.dropTable('event_participants');
    await queryInterface.dropTable('island_character_versions');
    await queryInterface.dropTable('arc_character_versions');
    await queryInterface.dropTable('character_versions');
    await queryInterface.dropTable('characters');
    await queryInterface.dropTable('events');
    await queryInterface.dropTable('arc_islands');
    await queryInterface.dropTable('islands');
    await queryInterface.dropTable('arcs');
    await queryInterface.dropTable('sagas');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('profile_permissions');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('profiles');
  },
};