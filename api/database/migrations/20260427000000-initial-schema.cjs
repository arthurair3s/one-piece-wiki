'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. profiles
    await queryInterface.createTable('profiles', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('profiles', ['deletedAt']);
    await queryInterface.addIndex('profiles', ['name'], { unique: true, where: { deletedAt: null }, name: 'profiles_name_unique' });

    // 2. permissions
    await queryInterface.createTable('permissions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('permissions', ['deletedAt']);
    await queryInterface.addIndex('permissions', ['slug'], { unique: true, where: { deletedAt: null }, name: 'permissions_slug_unique' });

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
      username: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false },
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
    await queryInterface.addIndex('users', ['username'], { unique: true, where: { deletedAt: null }, name: 'users_username_unique' });
    await queryInterface.addIndex('users', ['email'], { unique: true, where: { deletedAt: null }, name: 'users_email_unique' });

    // 5. sagas
    await queryInterface.createTable('sagas', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      order: { type: Sequelize.INTEGER, allowNull: false }, // RN02: ordem única por saga
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('sagas', ['deletedAt']);
    await queryInterface.addIndex('sagas', ['name'], { unique: true, where: { deletedAt: null }, name: 'sagas_name_unique' });
    await queryInterface.addIndex('sagas', ['order'], { unique: true, where: { deletedAt: null }, name: 'sagas_order_unique' });

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
    await queryInterface.addIndex('arcs', ['order', 'saga_id'], {
      unique: true,
      where: { deletedAt: null },
      name: 'unique_arc_order_per_saga'
    });
    await queryInterface.addIndex('arcs', ['deletedAt', 'saga_id']);

    // 7. islands
    await queryInterface.createTable('islands', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
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
    await queryInterface.addIndex('islands', ['name'], { unique: true, where: { deletedAt: null }, name: 'islands_name_unique' });

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
    await queryInterface.addIndex('arc_islands', ['deletedAt', 'arc_id', 'island_id']);
    await queryInterface.addIndex('arc_islands', ['arc_id', 'island_id'], {
      unique: true,
      where: { deletedAt: null },
      name: 'unique_arc_island_pair'
    });
    await queryInterface.addIndex('arc_islands', ['island_id'], {
      name: 'idx_arc_islands_island_id'
    });

    // 9. events
    await queryInterface.createTable('events', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      arc_island_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'arc_islands', key: 'id' },
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
    await queryInterface.addIndex('events', ['arc_island_id', 'order'], {
      unique: true,
      where: { deletedAt: null },
      name: 'unique_event_order_context'
    });
    await queryInterface.addIndex('events', ['deletedAt', 'arc_island_id']);

    // 10. characters
    await queryInterface.createTable('characters', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      deletedAt: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex('characters', ['deletedAt']);
    await queryInterface.addIndex('characters', ['slug'], { unique: true, where: { deletedAt: null }, name: 'characters_slug_unique' });

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
    await queryInterface.addIndex('arc_character_versions', ['arc_id', 'character_id'], {
      unique: true,
      where: { deletedAt: null },
      name: 'unique_one_version_per_character_in_arc'
    });
    await queryInterface.addIndex('arc_character_versions', ['deletedAt', 'arc_id']);


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
    await queryInterface.addIndex('event_participants', ['event_id', 'character_version_id'], {
      unique: true,
      where: { deletedAt: null },
      name: 'unique_event_participant'
    });
    await queryInterface.addIndex('event_participants', ['deletedAt']);
  },

  down: async (queryInterface, Sequelize) => {
    // A ordem do drop table deve ser exatamente a inversa da criação para não quebrar FKs
    await queryInterface.dropTable('event_participants');
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