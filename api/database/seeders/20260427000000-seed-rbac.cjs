'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. profiles
    await queryInterface.bulkInsert('profiles', [
      { id: 1, name: 'ADMIN', description: 'Acesso total ao sistema.', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'PLAYER', description: 'Usuário padrão (apenas visualização).', createdAt: new Date(), updatedAt: new Date() },
    ]);

    // 2. permissions (Definição de todos os slugs)
    const permissions = [
      // RBAC
      { id: 1, name: 'Listar Usuários', slug: 'users.view' },
      { id: 2, name: 'Criar Usuários', slug: 'users.create' },
      { id: 3, name: 'Deletar Usuários', slug: 'users.delete' },
      { id: 7, name: 'Editar Usuários', slug: 'users.update' },
      { id: 4, name: 'Ver Perfis', slug: 'profiles.view' },
      { id: 5, name: 'Criar Perfis', slug: 'profiles.create' },
      { id: 8, name: 'Editar Perfis', slug: 'profiles.update' },
      { id: 9, name: 'Deletar Perfis', slug: 'profiles.delete' },
      { id: 14, name: 'Vincular Permissões', slug: 'profiles.assign' },
      { id: 6, name: 'Listar Permissões', slug: 'permissions.view' },
      { id: 15, name: 'Criar Permissões', slug: 'permissions.create' },
      { id: 16, name: 'Editar Permissões', slug: 'permissions.update' },
      { id: 17, name: 'Deletar Permissões', slug: 'permissions.delete' },
      // Sagas
      { id: 10, name: 'Ver Sagas', slug: 'sagas.view' },
      { id: 11, name: 'Criar Sagas', slug: 'sagas.create' },
      { id: 12, name: 'Editar Sagas', slug: 'sagas.update' },
      { id: 13, name: 'Deletar Sagas', slug: 'sagas.delete' },
      // Arcos
      { id: 20, name: 'Ver Arcos', slug: 'arcs.view' },
      { id: 21, name: 'Criar Arcos', slug: 'arcs.create' },
      { id: 22, name: 'Editar Arcos', slug: 'arcs.update' },
      { id: 23, name: 'Deletar Arcos', slug: 'arcs.delete' },
      // Ilhas
      { id: 30, name: 'Ver Ilhas', slug: 'islands.view' },
      { id: 31, name: 'Criar Ilhas', slug: 'islands.create' },
      { id: 32, name: 'Editar Ilhas', slug: 'islands.update' },
      { id: 33, name: 'Deletar Ilhas', slug: 'islands.delete' },
      // Eventos
      { id: 40, name: 'Ver Eventos', slug: 'events.view' },
      { id: 41, name: 'Criar Eventos', slug: 'events.create' },
      { id: 42, name: 'Editar Eventos', slug: 'events.update' },
      { id: 43, name: 'Deletar Eventos', slug: 'events.delete' },
      // Personagens
      { id: 50, name: 'Ver Personagens', slug: 'characters.view' },
      { id: 51, name: 'Criar Personagens', slug: 'characters.create' },
      { id: 52, name: 'Editar Personagens', slug: 'characters.update' },
      { id: 53, name: 'Deletar Personagens', slug: 'characters.delete' },
      // Versões de Personagens
      { id: 60, name: 'Ver Versões', slug: 'character_versions.view' },
      { id: 61, name: 'Criar Versões', slug: 'character_versions.create' },
      { id: 62, name: 'Editar Versões', slug: 'character_versions.update' },
      { id: 63, name: 'Deletar Versões', slug: 'character_versions.delete' },
      // Vínculos Ilha-Personagem
      { id: 70, name: 'Ver Vínculos Ilha-Personagem', slug: 'island_char.view' },
      { id: 71, name: 'Criar Vínculo Ilha-Personagem', slug: 'island_char.create' },
      { id: 72, name: 'Deletar Vínculo Ilha-Personagem', slug: 'island_char.delete' },
    ].map(p => ({ ...p, createdAt: new Date(), updatedAt: new Date() }));

    await queryInterface.bulkInsert('permissions', permissions);

    // 3. profile_permissions (Vínculos)
    const adminPermissions = permissions.map(p => ({
      profile_id: 1,
      permission_id: p.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const playerPermissions = permissions
      .filter(p => 
        p.slug.endsWith('.view') && 
        !p.slug.startsWith('users.') && 
        !p.slug.startsWith('profiles.') && 
        !p.slug.startsWith('permissions.')
      )
      .map(p => ({
        profile_id: 2,
        permission_id: p.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    await queryInterface.bulkInsert('profile_permissions', [...adminPermissions, ...playerPermissions]);

    // 4. users
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        username: 'admin',
        email: 'admin@admin.com',
        password_hash: '$2b$10$iRO0TR/BS.K0X4S3aw9NhO3GZXcFmec9gdkMRtOngE.YdHpD7IpUG', // admin123
        profile_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        username: 'luffy',
        email: 'luffy@onepiece.com',
        password_hash: '$2b$10$PYfEsoyI5kJiabhd5SS1be8Kj3Nf1HsFdeiqQhxnRY4sBhUx34A/.', // luffy123
        profile_id: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('profile_permissions', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.bulkDelete('profiles', null, {});
  },
};
