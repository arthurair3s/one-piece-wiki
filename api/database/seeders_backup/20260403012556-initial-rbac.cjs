'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Profiles',
      [
        {
          id: 1,
          name: 'ADMIN',
          description: 'Acesso total ao sistema e gerenciamento de conteúdo.',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'PLAYER',
          description: 'Usuário padrão que explora o mapa e responde quizzes.',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );

    await queryInterface.bulkInsert(
      'Permissions',
      [
        {
          id: 1,
          name: 'Listar Usuários',
          slug: 'users.view',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Criar Usuários',
          slug: 'users.create',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: 'Deletar Usuários',
          slug: 'users.delete',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: 'Ver Perfis',
          slug: 'profiles.view',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          name: 'Criar Perfis',
          slug: 'profiles.create',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          name: 'Gerenciar Permissões',
          slug: 'permissions.view',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );

    await queryInterface.bulkInsert(
      'ProfilePermissions',
      [
        { profile_id: 1, permission_id: 1, createdAt: new Date(), updatedAt: new Date() },
        { profile_id: 1, permission_id: 2, createdAt: new Date(), updatedAt: new Date() },
        { profile_id: 1, permission_id: 3, createdAt: new Date(), updatedAt: new Date() },
        { profile_id: 1, permission_id: 4, createdAt: new Date(), updatedAt: new Date() },
        { profile_id: 1, permission_id: 5, createdAt: new Date(), updatedAt: new Date() },
        { profile_id: 1, permission_id: 6, createdAt: new Date(), updatedAt: new Date() },
      ],
      {},
    );

    return queryInterface.bulkInsert(
      'Users',
      [
        {
          id: 1,
          username: 'admin',
          email: 'admin@admin.com',
          password_hash: '$2b$10$iRO0TR/BS.K0X4S3aw9NhO3GZXcFmec9gdkMRtOngE.YdHpD7IpUG', // admin123
          profile_id: 1, // ADMIN
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('ProfilePermissions', null, {});
    await queryInterface.bulkDelete('Permissions', null, {});
    await queryInterface.bulkDelete('Profiles', null, {});
  },
};
