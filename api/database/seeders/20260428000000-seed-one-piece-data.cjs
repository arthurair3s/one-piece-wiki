'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 1. Sagas (Inserindo Saga East Blue caso não exista, ID 1)
    await queryInterface.bulkInsert('sagas', [
      { id: 1, name: 'Saga do East Blue', order: 1, description: 'O início da jornada no mar mais fraco.', createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });

    // 2. Arcos
    await queryInterface.bulkInsert('arcs', [
      { id: 1, name: 'Romance Dawn', description: 'Luffy inicia sua jornada e conhece Coby.', saga_id: 1, order: 1, createdAt: now, updatedAt: now },
      { id: 2, name: 'Shells Town', description: 'Luffy encontra e recruta Zoro.', saga_id: 1, order: 2, createdAt: now, updatedAt: now },
      { id: 3, name: 'Orange Town', description: 'Luffy enfrenta Buggy e conhece Nami.', saga_id: 1, order: 3, createdAt: now, updatedAt: now },
      { id: 4, name: 'Vila Syrup', description: 'Luffy recruta Usopp e ganha o Merry.', saga_id: 1, order: 4, createdAt: now, updatedAt: now },
      { id: 5, name: 'Baratie', description: 'Luffy recruta Sanji.', saga_id: 1, order: 5, createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });

    // 3. Ilhas (coordenadas bem distribuídas para posicionamento isométrico no mapa)
    await queryInterface.bulkInsert('islands', [
      { id: 1, name: 'Vila Foosha', description: 'Ilha natal de Luffy.', coordinate_x: 89.3, coordinate_y: 35.9, coordinate_z: 0, rotation_y: -90.0, scale: 0.85, model_url: 'models/foosha.gltf', thumbnail_url: 'https://images.grandline.com/thumbnails/foosha.png', is_active: true, createdAt: now, updatedAt: now },
      { id: 2, name: 'Shells Town', description: 'Base da Marinha comandada por Morgan.', coordinate_x: 65.2, coordinate_y: 9.1, coordinate_z: 0, rotation_y: -133.0, scale: 2.00, model_url: 'models/shells-town.gltf', thumbnail_url: 'https://images.grandline.com/thumbnails/shells-town.png', is_active: true, createdAt: now, updatedAt: now },
      { id: 3, name: 'Orange Town', description: 'Cidade dominada por Buggy.', coordinate_x: 44.9, coordinate_y: 39.6, coordinate_z: 0, model_url: '', thumbnail_url: 'https://images.grandline.com/thumbnails/orange-town.png', is_active: true, createdAt: now, updatedAt: now },
      { id: 4, name: 'Ilha Gecko', description: 'Terra natal de Usopp.', coordinate_x: 16.0, coordinate_y: 37.5, coordinate_z: 0, model_url: '', thumbnail_url: 'https://images.grandline.com/thumbnails/syrup.png', is_active: true, createdAt: now, updatedAt: now },
      { id: 5, name: 'Baratie', description: 'O famoso restaurante flutuante.', coordinate_x: 4.3, coordinate_y: 81.0, coordinate_z: 0, model_url: '', thumbnail_url: 'https://images.grandline.com/thumbnails/baratie.png', is_active: true, createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });

    // 4. Arc_Islands (Pivot)
    await queryInterface.bulkInsert('arc_islands', [
      { arc_id: 1, island_id: 1, order: 1, createdAt: now, updatedAt: now },
      { arc_id: 2, island_id: 2, order: 1, createdAt: now, updatedAt: now },
      { arc_id: 3, island_id: 3, order: 1, createdAt: now, updatedAt: now },
      { arc_id: 4, island_id: 4, order: 1, createdAt: now, updatedAt: now },
      { arc_id: 5, island_id: 5, order: 1, createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });

    // 5. Personagens
    await queryInterface.bulkInsert('characters', [
      { id: 1, name: 'Monkey D. Luffy', slug: 'monkey-d-luffy', createdAt: now, updatedAt: now },
      { id: 2, name: 'Roronoa Zoro', slug: 'roronoa-zoro', createdAt: now, updatedAt: now },
      { id: 3, name: 'Nami', slug: 'nami', createdAt: now, updatedAt: now },
      { id: 4, name: 'Coby', slug: 'coby', createdAt: now, updatedAt: now },
      { id: 5, name: 'Alvida', slug: 'alvida', createdAt: now, updatedAt: now },
      { id: 6, name: 'Morgan', slug: 'morgan', createdAt: now, updatedAt: now },
      { id: 7, name: 'Buggy', slug: 'buggy', createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });

    // 6. Versões de Personagem
    await queryInterface.bulkInsert('character_versions', [
      { id: 1, character_id: 1, alias: 'Luffy', epithet: 'Chapéu de Palha', bounty: 0, status: 'ALIVE', image_url: 'https://exemplo.com/0CH6WXWk', description: 'Início da jornada.', createdAt: now, updatedAt: now },
      { id: 2, character_id: 2, alias: 'Caçador de Piratas', epithet: 'Zoro', bounty: 0, status: 'ALIVE', image_url: 'https://exemplo.com/0CH6WXWk', description: 'Antes de ganhar fama.', createdAt: now, updatedAt: now },
      { id: 3, character_id: 3, alias: 'Gata Ladra', epithet: 'Nami', bounty: 0, status: 'ALIVE', image_url: 'https://exemplo.com/0CH6WXWk', description: 'Ainda não integrante oficial.', createdAt: now, updatedAt: now },
      { id: 4, character_id: 7, alias: 'Buggy', epithet: 'O Palhaço', bounty: 15000000, status: 'ALIVE', image_url: 'https://exemplo.com/hgPmBiK8', description: 'Capitão dos Piratas do Buggy, derrotado por Luffy em Orange Town.', createdAt: now, updatedAt: now },
      { id: 5, character_id: 4, alias: 'Coby', epithet: 'Recruta da Marinha', bounty: 0, status: 'ALIVE', image_url: 'https://exemplo.com/hgPmBiK8', description: 'Inicialmente um garoto medroso, decide seguir o sonho de se tornar marinheiro após conhecer Luffy.', createdAt: now, updatedAt: now },
      { id: 6, character_id: 5, alias: 'Alvida', epithet: 'Clava de Ferro', bounty: 5000000, status: 'ALIVE', image_url: 'https://exemplo.com/hgPmBiK8', description: 'Capitã pirata derrotada por Luffy logo no início de sua jornada.', createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });

    // 7. Arc_CharacterVersions (Pivot N:N)
    await queryInterface.bulkInsert('arc_character_versions', [
      { arc_id: 1, character_version_id: 1, character_id: 1, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 2, character_version_id: 1, character_id: 1, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 3, character_version_id: 1, character_id: 1, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 2, character_version_id: 2, character_id: 2, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 3, character_version_id: 2, character_id: 2, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 3, character_version_id: 3, character_id: 3, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 3, character_version_id: 4, character_id: 7, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 1, character_version_id: 5, character_id: 4, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 1, character_version_id: 6, character_id: 5, order: 0, createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });

    // 9. Eventos
    await queryInterface.bulkInsert('events', [
      { id: 1, arc_island_id: 1, title: 'Partida de Luffy', description: 'Luffy sai de sua vila decidido a se tornar o Rei dos Piratas.', type: 'Início', order: 1, createdAt: now, updatedAt: now },
      { id: 2, arc_island_id: 1, title: 'Encontro com Coby', description: 'Luffy conhece Coby preso no navio de Alvida.', type: 'Encontro', order: 2, createdAt: now, updatedAt: now },
      { id: 3, arc_island_id: 1, title: 'Derrota de Alvida', description: 'Luffy derrota Alvida com um golpe.', type: 'Batalha', order: 3, createdAt: now, updatedAt: now },
      { id: 4, arc_island_id: 1, title: 'Libertação de Coby', description: 'Coby decide seguir seu sonho de entrar para a Marinha.', type: 'Momento-chave', order: 4, createdAt: now, updatedAt: now },
      { id: 5, arc_island_id: 2, title: 'Encontro com Zoro', description: 'Luffy encontra Zoro preso na base da Marinha.', type: 'Encontro', order: 1, createdAt: now, updatedAt: now },
      { id: 6, arc_island_id: 2, title: 'Promessa de Zoro', description: 'Zoro aceita se juntar a Luffy caso sobreviva.', type: 'Momento-chave', order: 2, createdAt: now, updatedAt: now },
      { id: 7, arc_island_id: 2, title: 'Recuperação das espadas', description: 'Luffy recupera as espadas de Zoro.', type: 'Ação', order: 3, createdAt: now, updatedAt: now },
      { id: 8, arc_island_id: 2, title: 'Derrota de Morgan', description: 'Luffy derrota o Capitão Morgan.', type: 'Batalha', order: 4, createdAt: now, updatedAt: now },
      { id: 9, arc_island_id: 2, title: 'Zoro entra para o bando', description: 'Zoro se torna o primeiro companheiro de Luffy.', type: 'Recrutamento', order: 5, createdAt: now, updatedAt: now },
      { id: 10, arc_island_id: 3, title: 'Encontro com Nami', description: 'Luffy conhece Nami, uma ladra habilidosa.', type: 'Encontro', order: 1, createdAt: now, updatedAt: now },
      { id: 11, arc_island_id: 3, title: 'Conflito com Buggy', description: 'Buggy revela seus poderes e ameaça a cidade.', type: 'Introdução', order: 2, createdAt: now, updatedAt: now },
      { id: 12, arc_island_id: 3, title: 'Derrota de Buggy', description: 'Luffy derrota Buggy e liberta Orange Town.', type: 'Batalha', order: 3, createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });

    // 10. Participantes dos Eventos
    await queryInterface.bulkInsert('event_participants', [
      { event_id: 1, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 2, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 2, character_version_id: 5, createdAt: now, updatedAt: now },
      { event_id: 2, character_version_id: 6, createdAt: now, updatedAt: now },
      { event_id: 3, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 3, character_version_id: 6, createdAt: now, updatedAt: now },
      { event_id: 4, character_version_id: 5, createdAt: now, updatedAt: now },
      { event_id: 4, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 5, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 5, character_version_id: 2, createdAt: now, updatedAt: now },
      { event_id: 6, character_version_id: 2, createdAt: now, updatedAt: now },
      { event_id: 6, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 7, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 7, character_version_id: 2, createdAt: now, updatedAt: now },
      { event_id: 8, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 8, character_version_id: 2, createdAt: now, updatedAt: now },
      { event_id: 9, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 9, character_version_id: 2, createdAt: now, updatedAt: now },
      { event_id: 10, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 10, character_version_id: 3, createdAt: now, updatedAt: now },
      { event_id: 11, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 11, character_version_id: 3, createdAt: now, updatedAt: now },
      { event_id: 11, character_version_id: 4, createdAt: now, updatedAt: now },
      { event_id: 12, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 12, character_version_id: 4, createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });

    // Sincronizar sequências (PostgreSQL) para evitar erro de ID duplicado após seed com IDs explícitos
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query(`SELECT setval('"sagas_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "sagas"));`);
      await queryInterface.sequelize.query(`SELECT setval('"arcs_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "arcs"));`);
      await queryInterface.sequelize.query(`SELECT setval('"islands_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "islands"));`);
      await queryInterface.sequelize.query(`SELECT setval('"characters_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "characters"));`);
      await queryInterface.sequelize.query(`SELECT setval('"character_versions_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "character_versions"));`);
      await queryInterface.sequelize.query(`SELECT setval('"events_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "events"));`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('event_participants', null, {});
    await queryInterface.bulkDelete('events', null, {});
    await queryInterface.bulkDelete('arc_character_versions', null, {});
    await queryInterface.bulkDelete('character_versions', null, {});
    await queryInterface.bulkDelete('characters', null, {});
    await queryInterface.bulkDelete('arc_islands', null, {});
    await queryInterface.bulkDelete('islands', null, {});
    await queryInterface.bulkDelete('arcs', null, {});
  }
};
