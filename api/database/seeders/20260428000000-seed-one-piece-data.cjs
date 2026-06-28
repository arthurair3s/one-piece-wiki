'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Limpar dados existentes antes de inserir para garantir que as novas descrições detalhadas sejam aplicadas
    await queryInterface.bulkDelete('event_participants', null, {});
    await queryInterface.bulkDelete('events', null, {});
    await queryInterface.bulkDelete('arc_character_versions', null, {});
    await queryInterface.bulkDelete('character_versions', null, {});
    await queryInterface.bulkDelete('characters', null, {});
    await queryInterface.bulkDelete('arc_islands', null, {});
    await queryInterface.bulkDelete('islands', null, {});
    await queryInterface.bulkDelete('arcs', null, {});
    await queryInterface.bulkDelete('sagas', null, {});

    // 1. Sagas
    await queryInterface.bulkInsert('sagas', [
      {
        id: 1,
        name: 'Saga de East Blue',
        order: 1,
        description: 'A primeira saga de One Piece, mostrando Luffy reunindo seus primeiros tripulantes.',
        createdAt: now,
        updatedAt: now
      }
    ], { ignoreDuplicates: true });

    // 2. Arcos
    await queryInterface.bulkInsert('arcs', [
      {
        id: 1,
        name: 'Romance Dawn',
        description: 'O início da jornada de Monkey D. Luffy e o recrutamento de Zoro.',
        saga_id: 1,
        order: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Orange Town',
        description: 'Luffy enfrenta Buggy o Palhaço e recruta Nami como navegadora.',
        saga_id: 1,
        order: 2,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'Vila Syrup',
        description: 'Luffy e seus companheiros encontram Usopp e defendem a herdeira Kaya contra o Capitão Kuro.',
        saga_id: 1,
        order: 3,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        name: 'Baratie',
        description: 'Luffy defende o restaurante flutuante contra Don Krieg e conhece o cozinheiro Sanji.',
        saga_id: 1,
        order: 4,
        createdAt: now,
        updatedAt: now
      }
    ], { ignoreDuplicates: true });

    // 3. Ilhas (coordenadas bem distribuídas para posicionamento isométrico no mapa)
    await queryInterface.bulkInsert('islands', [
      {
        id: 1,
        name: 'Vila Foosha',
        description: 'A pacífica ilha de Dawn Island, terra natal de Monkey D. Luffy. Caracterizada por um relevo coberto por florestas densas, costas rochosas e um clima ameno, ela abriga a pacata Vila Foosha, um pequeno porto de pescadores, e o Monte Colubo, esconderijo dos bandidos da montanha comandados por Dadan. Dawn Island também serviu de ancoradouro temporário para os Piratas do Ruivo e foi o local histórico onde Luffy acidentalmente consumiu a Gomu Gomu no Mi.',
        coordinate_x: 89.3,
        coordinate_y: 35.9,
        coordinate_z: 0.0,
        rotation_y: -90.0,
        scale: 0.85,
        model_url: 'models/foosha.gltf',
        thumbnail_url: 'https://images.grandline.com/thumbnails/foosha.png',
        is_active: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Shells Town',
        description: 'Uma importante ilha portuária de relevo urbano suave no East Blue, cercada por baías protegidas e dominada pela grande Base de Operações da 153ª Divisão da Marinha. Shells Town abriga a famosa Taberna local gerenciada por Rika e sua mãe. A ilha foi o cenário histórico da libertação e queda da tirania do corrupto Capitão Morgan Mão-de-Machado, e o local onde Roronoa Zoro juntou-se a Monkey D. Luffy como o primeiro tripulante dos Piratas do Chapéu de Palha.',
        coordinate_x: 65.2,
        coordinate_y: 9.1,
        coordinate_z: 0.0,
        rotation_y: -133.0,
        scale: 2.00,
        model_url: 'models/shells-town.gltf',
        thumbnail_url: 'https://images.grandline.com/thumbnails/shells-town.png',
        is_active: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'Orange Town',
        description: 'Uma ilha costeira plana e pitoresca, conhecida por seus bosques frutíferos e pomares abundantes de laranjas. Orange Town abriga o porto central, a Prefeitura e o pet shop que o cão incrivelmente leal Chouchou protege bravamente. A cidade foi ocupada e devastada pela tripulação dos Piratas do Buggy, tornando-se o cenário de batalhas memoráveis onde Luffy, Zoro e Nami uniram suas forças pela primeira vez para libertar os moradores da opressão.',
        coordinate_x: 44.9,
        coordinate_y: 39.6,
        coordinate_z: 0.0,
        rotation_y: -180.0,
        scale: 1.00,
        model_url: '',
        thumbnail_url: 'https://images.grandline.com/thumbnails/orange-town.png',
        is_active: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        name: 'Ilha Gecko',
        description: 'Uma pacífica ilha dominada por colinas verdejantes e encostas inclinadas de terra batida, isolada do oceano por penhascos íngremes ideais para defesa. Nela situa-se a Vila Syrup, a imponente Mansão da herdeira Kaya e as encostas norte e sul. Sendo a terra natal de Usopp, foi o palco onde o bando impediu a nefasta conspiração do mordomo Klahadore (Capitão Kuro) e recebeu de presente a caravela Going Merry para iniciar suas navegações pelo mar.',
        coordinate_x: 16.0,
        coordinate_y: 37.5,
        coordinate_z: 0.0,
        rotation_y: -180.0,
        scale: 1.00,
        model_url: '',
        thumbnail_url: 'https://images.grandline.com/thumbnails/syrup.png',
        is_active: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 5,
        name: 'Baratie',
        description: 'O famoso restaurante flutuante do East Blue, construído em um navio de grande porte no formato de um peixe e ancorado no meio do oceano. Fundado pelo ex-capitão pirata Zeff Perna Vermelha, conta com convés de combate retráteis e uma cozinha lendária. O Baratie foi o palco do duelo histórico entre Roronoa Zoro e Mihawk Olhos de Gavião, além de servir como o local de recrutamento do cozinheiro Sanji após Luffy derrotar a armada do Almirante Pirata Don Krieg.',
        coordinate_x: 4.3,
        coordinate_y: 81.0,
        coordinate_z: 0.0,
        rotation_y: -180.0,
        scale: 1.00,
        model_url: '',
        thumbnail_url: 'https://images.grandline.com/thumbnails/baratie.png',
        is_active: true,
        createdAt: now,
        updatedAt: now
      }
    ], { ignoreDuplicates: true });

    // 4. Arc_Islands (Pivot)
    await queryInterface.bulkInsert('arc_islands', [
      { id: 1, arc_id: 1, island_id: 1, order: 1, createdAt: now, updatedAt: now },
      { id: 2, arc_id: 1, island_id: 2, order: 2, createdAt: now, updatedAt: now },
      { id: 3, arc_id: 2, island_id: 3, order: 1, createdAt: now, updatedAt: now },
      { id: 4, arc_id: 3, island_id: 4, order: 1, createdAt: now, updatedAt: now },
      { id: 5, arc_id: 4, island_id: 5, order: 1, createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });

    // 5. Personagens
    await queryInterface.bulkInsert('characters', [
      { id: 1, name: 'Monkey D. Luffy', slug: 'monkey-d-luffy', createdAt: now, updatedAt: now },
      { id: 2, name: 'Roronoa Zoro', slug: 'roronoa-zoro', createdAt: now, updatedAt: now },
      { id: 3, name: 'Nami', slug: 'nami', createdAt: now, updatedAt: now },
      { id: 4, name: 'Coby', slug: 'coby', createdAt: now, updatedAt: now },
      { id: 5, name: 'Alvida', slug: 'alvida', createdAt: now, updatedAt: now },
      { id: 7, name: 'Buggy', slug: 'buggy', createdAt: now, updatedAt: now },
      { id: 8, name: 'Chouchou', slug: 'chouchou', createdAt: now, updatedAt: now },
      { id: 9, name: 'Usopp', slug: 'usopp', createdAt: now, updatedAt: now },
      { id: 10, name: 'Kaya', slug: 'kaya', createdAt: now, updatedAt: now },
      { id: 11, name: 'Kuro', slug: 'kuro', createdAt: now, updatedAt: now },
      { id: 12, name: 'Sanji', slug: 'sanji', createdAt: now, updatedAt: now },
      { id: 13, name: 'Zeff', slug: 'zeff', createdAt: now, updatedAt: now },
      { id: 14, name: 'Don Krieg', slug: 'don-krieg', createdAt: now, updatedAt: now },
      { id: 15, name: 'Dracule Mihawk', slug: 'dracule-mihawk', createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });

    // 6. Versões de Personagem
    await queryInterface.bulkInsert('character_versions', [
      { id: 1, character_id: 1, alias: 'Luffy (Início)', epithet: 'Chapéu de Palha', bounty: 0, status: 'ALIVE', image_url: '/characters/luffy-v1.jpg', description: 'O protagonista que sonha em se tornar o Rei dos Piratas.', createdAt: now, updatedAt: now },
      { id: 2, character_id: 2, alias: 'Zoro (Início)', epithet: 'Caçador de Piratas', bounty: 0, status: 'ALIVE', image_url: '/characters/zoro-v1.webp', description: 'O lendário caçador de recompensas que usa três espadas.', createdAt: now, updatedAt: now },
      { id: 3, character_id: 3, alias: 'Nami (Início)', epithet: 'Gata Ladra', bounty: 0, status: 'ALIVE', image_url: '/characters/nami-v1.webp', description: 'Uma navegadora genial e ladra especializada em roubar piratas.', createdAt: now, updatedAt: now },
      { id: 4, character_id: 7, alias: 'Buggy (O Palhaço)', epithet: 'O Palhaço', bounty: 15000000, status: 'ALIVE', image_url: '/characters/buggy-v1.webp', description: 'Capitão pirata usuário da Bara Bara no Mi que aterroriza Orange Town.', createdAt: now, updatedAt: now },
      { id: 5, character_id: 4, alias: 'Coby (Recruta)', epithet: 'Recruta da Marinha', bounty: 0, status: 'ALIVE', image_url: '/characters/Kobe-v1.jpg', description: 'Jovem covarde que quer se tornar um oficial da Marinha.', createdAt: now, updatedAt: now },
      { id: 6, character_id: 5, alias: 'Alvida (Clava)', epithet: 'Clava de Ferro', bounty: 5000000, status: 'ALIVE', image_url: '/characters/alvida-v1.webp', description: 'A capitã gorda que aterrorizava Coby antes de Luffy surgir.', createdAt: now, updatedAt: now },
      { id: 7, character_id: 1, alias: 'Luffy (Orange Town)', epithet: 'Chapéu de Palha', bounty: 0, status: 'ALIVE', image_url: '/characters/luffy-v1.jpg', description: 'O capitão pirata que procura aliados no East Blue.', createdAt: now, updatedAt: now },
      { id: 8, character_id: 2, alias: 'Zoro (Orange Town)', epithet: 'Caçador de Piratas', bounty: 0, status: 'ALIVE', image_url: '/characters/zoro-v1.webp', description: 'Espadachim do bando, ferido na luta contra Buggy.', createdAt: now, updatedAt: now },
      { id: 9, character_id: 8, alias: 'Chouchou', epithet: 'Cão de Orange Town', bounty: 0, status: 'ALIVE', image_url: '/characters/chouchou-v1.png', description: 'Um cão incrivelmente leal que guarda o pet shop do seu falecido dono.', createdAt: now, updatedAt: now },
      { id: 10, character_id: 1, alias: 'Luffy (Syrup)', epithet: 'Chapéu de Palha', bounty: 0, status: 'ALIVE', image_url: '/characters/luffy-v1.jpg', description: 'Capitão do bando que busca um navio de verdade.', createdAt: now, updatedAt: now },
      { id: 11, character_id: 2, alias: 'Zoro (Syrup)', epithet: 'Caçador de Piratas', bounty: 0, status: 'ALIVE', image_url: '/characters/zoro-v1.webp', description: 'Espadachim que protege a encosta contra os piratas Kuroneko.', createdAt: now, updatedAt: now },
      { id: 12, character_id: 3, alias: 'Nami (Syrup)', epithet: 'Gata Ladra', bounty: 0, status: 'ALIVE', image_url: '/characters/nami-v1.webp', description: 'Navegadora temporária focada no ouro.', createdAt: now, updatedAt: now },
      { id: 13, character_id: 9, alias: 'Usopp (Início)', epithet: 'Sniper do Bando', bounty: 0, status: 'ALIVE', image_url: '/characters/usopp-v1.jpg', description: 'Um jovem mentiroso que sonha em se tornar um valente guerreiro do mar.', createdAt: now, updatedAt: now },
      { id: 14, character_id: 10, alias: 'Kaya', epithet: 'Herdeira de Syrup', bounty: 0, status: 'ALIVE', image_url: '/characters/kaya-v1.jpg', description: 'Uma jovem herdeira doente que adora ouvir as histórias fantasiosas de Usopp.', createdAt: now, updatedAt: now },
      { id: 15, character_id: 11, alias: 'Capitão Kuro', epithet: 'Kuro das Centenas de Planos', bounty: 16000000, status: 'ALIVE', image_url: '/characters/kuro-1.jpeg', description: 'O temido capitão pirata que finge ser o dócil mordomo Klahadore para roubar Kaya.', createdAt: now, updatedAt: now },
      { id: 16, character_id: 1, alias: 'Luffy (Baratie)', epithet: 'Chapéu de Palha', bounty: 0, status: 'ALIVE', image_url: '/characters/luffy-v1.jpg', description: 'Trabalha como faxineiro temporário para pagar um estrago feito no restaurante.', createdAt: now, updatedAt: now },
      { id: 17, character_id: 2, alias: 'Zoro (Baratie)', epithet: 'Caçador de Piratas', bounty: 0, status: 'ALIVE', image_url: '/characters/zoro-v1.webp', description: 'Encontra Dracule Mihawk e decide desafiá-lo para um duelo.', createdAt: now, updatedAt: now },
      { id: 18, character_id: 3, alias: 'Nami (Baratie)', epithet: 'Gata Ladra', bounty: 0, status: 'ALIVE', image_url: '/characters/nami-v1.webp', description: 'Foge secretamente levando o navio Going Merry rumo ao Arlong Park.', createdAt: now, updatedAt: now },
      { id: 19, character_id: 9, alias: 'Usopp (Baratie)', epithet: 'Sniper do Bando', bounty: 0, status: 'ALIVE', image_url: '/characters/usopp-v1.jpg', description: 'Tenta perseguir Nami junto com Zoro e Johnny.', createdAt: now, updatedAt: now },
      { id: 20, character_id: 12, alias: 'Sanji', epithet: 'Perna Negra', bounty: 0, status: 'ALIVE', image_url: '/characters/sanji-v1.jpg', description: 'Subchefe de cozinha do Baratie, conhecido por sua comida divina e pontapés ferozes.', createdAt: now, updatedAt: now },
      { id: 21, character_id: 13, alias: 'Don Zeff', epithet: 'Perna Vermelha', bounty: 0, status: 'ALIVE', image_url: '/characters/zeff-v1.webp', description: 'O chef fundador do Baratie e ex-capitão pirata que salvou a vida de Sanji no passado.', createdAt: now, updatedAt: now },
      { id: 22, character_id: 14, alias: 'Don Krieg', epithet: 'O Almirante Pirata', bounty: 17000000, status: 'ALIVE', image_url: '/characters/don-krieg-v1.png', description: 'Líder da maior armada pirata do East Blue, destruída na Grand Line.', createdAt: now, updatedAt: now },
      { id: 23, character_id: 15, alias: 'Mihawk', epithet: 'Olhos de Gavião', bounty: 3590000000, status: 'ALIVE', image_url: '/characters/dracule-mihawk-v1.jpg', description: 'Membro dos Shichibukai e o maior espadachim do mundo.', createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });



    // 7. Arc_CharacterVersions (Pivot N:N)
    await queryInterface.bulkInsert('arc_character_versions', [
      { arc_id: 1, character_version_id: 1, character_id: 1, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 1, character_version_id: 2, character_id: 2, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 1, character_version_id: 5, character_id: 4, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 1, character_version_id: 6, character_id: 5, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 2, character_version_id: 7, character_id: 1, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 2, character_version_id: 8, character_id: 2, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 2, character_version_id: 3, character_id: 3, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 2, character_version_id: 4, character_id: 7, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 2, character_version_id: 9, character_id: 8, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 3, character_version_id: 10, character_id: 1, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 3, character_version_id: 11, character_id: 2, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 3, character_version_id: 12, character_id: 3, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 3, character_version_id: 13, character_id: 9, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 3, character_version_id: 14, character_id: 10, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 3, character_version_id: 15, character_id: 11, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 4, character_version_id: 16, character_id: 1, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 4, character_version_id: 17, character_id: 2, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 4, character_version_id: 18, character_id: 3, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 4, character_version_id: 19, character_id: 9, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 4, character_version_id: 20, character_id: 12, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 4, character_version_id: 21, character_id: 13, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 4, character_version_id: 22, character_id: 14, order: 0, createdAt: now, updatedAt: now },
      { arc_id: 4, character_version_id: 23, character_id: 15, order: 0, createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });

    // 8. Eventos
    await queryInterface.bulkInsert('events', [
      { id: 1, arc_island_id: 1, title: 'Luffy conhece Coby', description: 'Luffy acorda de dentro de um barril no navio de Alvida e ajuda Coby a fugir.', type: 'LORE', order: 1, createdAt: now, updatedAt: now },
      { id: 2, arc_island_id: 1, title: 'Luffy derrota Alvida', description: 'Luffy nocauteia Alvida com um único Gomu Gomu no Pistol para proteger Coby.', type: 'COMBAT', order: 2, createdAt: now, updatedAt: now },
      { id: 3, arc_island_id: 2, title: 'Luffy conhece Zoro', description: 'Luffy invade a base militar da marinha em Shells Town e liberta Zoro, convencendo-o a ser seu imediato.', type: 'LORE', order: 3, createdAt: now, updatedAt: now },
      { id: 4, arc_island_id: 2, title: 'Luffy derrota Capitão Morgan', description: 'Zoro e Luffy lutam juntos para libertar a cidade do corrupto Capitão da Marinha Morgan Mão-de-Machado.', type: 'COMBAT', order: 4, createdAt: now, updatedAt: now },
      { id: 5, arc_island_id: 3, title: 'Luffy conhece Nami', description: 'Luffy cai do céu e se depara com Nami, que o engana para entregá-lo aos piratas do Buggy.', type: 'LORE', order: 1, createdAt: now, updatedAt: now },
      { id: 6, arc_island_id: 3, title: 'O Leal Cão Chouchou', description: 'Chouchou luta bravamente para proteger a loja de ração contra os homens de Buggy.', type: 'LORE', order: 2, createdAt: now, updatedAt: now },
      { id: 7, arc_island_id: 3, title: 'Derrota de Buggy', description: 'Luffy e Nami unem forças para amarrar as partes do corpo de Buggy, e Luffy o arremessa para longe com o Gomu Gomu no Bazooka.', type: 'COMBAT', order: 3, createdAt: now, updatedAt: now },
      { id: 8, arc_island_id: 4, title: 'Encontro com Usopp', description: 'Luffy e o bando chegam a Syrup e são recebidos pelas \'mentiras\' de Usopp, logo virando amigos.', type: 'LORE', order: 1, createdAt: now, updatedAt: now },
      { id: 9, arc_island_id: 4, title: 'Conspiração de Klahadore', description: 'Usopp e Luffy escutam Klahadore tramando com Jango o assassinato de Kaya para obter sua herança.', type: 'LORE', order: 2, createdAt: now, updatedAt: now },
      { id: 10, arc_island_id: 4, title: 'Luffy derrota Capitão Kuro', description: 'Luffy enfrenta a incrível velocidade do golpe Shakushi de Kuro e o derrota na encosta.', type: 'COMBAT', order: 3, createdAt: now, updatedAt: now },
      { id: 11, arc_island_id: 4, title: 'Partida do Going Merry', description: 'Como agradecimento, Kaya doa a caravela Going Merry, e Usopp é convidado a juntar-se oficialmente ao bando.', type: 'LORE', order: 4, createdAt: now, updatedAt: now },
      { id: 12, arc_island_id: 5, title: 'Chegada ao Baratie', description: 'Luffy atinge acidentalmente o Baratie com um tiro de canhão e é forçado a trabalhar lá.', type: 'LORE', order: 1, createdAt: now, updatedAt: now },
      { id: 13, arc_island_id: 5, title: 'Zoro vs Mihawk', description: 'Mihawk surge caçando a frota de Krieg. Zoro o desafia em um duelo e é derrotado, prometendo nunca mais perder.', type: 'COMBAT', order: 2, createdAt: now, updatedAt: now },
      { id: 14, arc_island_id: 5, title: 'Invasão de Don Krieg', description: 'Krieg tenta roubar o restaurante flutuante para reatar sua frota e alimentar seus homens famintos.', type: 'COMBAT', order: 3, createdAt: now, updatedAt: now },
      { id: 15, arc_island_id: 5, title: 'Luffy derrota Don Krieg', description: 'Luffy quebra a armadura de aço de Krieg e vence a batalha usando o Gomu Gomu no Ozuchi.', type: 'COMBAT', order: 4, createdAt: now, updatedAt: now },
      { id: 16, arc_island_id: 5, title: 'Sanji junta-se ao Bando', description: 'Após uma despedida emocionante e chorosa de Zeff e dos cozinheiros, Sanji embarca como cozinheiro do bando.', type: 'LORE', order: 5, createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });

    // 9. Participantes dos Eventos
    await queryInterface.bulkInsert('event_participants', [
      { event_id: 1, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 1, character_version_id: 5, createdAt: now, updatedAt: now },
      { event_id: 1, character_version_id: 6, createdAt: now, updatedAt: now },
      { event_id: 2, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 2, character_version_id: 5, createdAt: now, updatedAt: now },
      { event_id: 2, character_version_id: 6, createdAt: now, updatedAt: now },
      { event_id: 3, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 3, character_version_id: 2, createdAt: now, updatedAt: now },
      { event_id: 3, character_version_id: 5, createdAt: now, updatedAt: now },
      { event_id: 4, character_version_id: 1, createdAt: now, updatedAt: now },
      { event_id: 4, character_version_id: 2, createdAt: now, updatedAt: now },
      { event_id: 5, character_version_id: 7, createdAt: now, updatedAt: now },
      { event_id: 5, character_version_id: 8, createdAt: now, updatedAt: now },
      { event_id: 5, character_version_id: 3, createdAt: now, updatedAt: now },
      { event_id: 5, character_version_id: 4, createdAt: now, updatedAt: now },
      { event_id: 6, character_version_id: 7, createdAt: now, updatedAt: now },
      { event_id: 6, character_version_id: 3, createdAt: now, updatedAt: now },
      { event_id: 6, character_version_id: 9, createdAt: now, updatedAt: now },
      { event_id: 7, character_version_id: 7, createdAt: now, updatedAt: now },
      { event_id: 7, character_version_id: 3, createdAt: now, updatedAt: now },
      { event_id: 7, character_version_id: 4, createdAt: now, updatedAt: now },
      { event_id: 8, character_version_id: 10, createdAt: now, updatedAt: now },
      { event_id: 8, character_version_id: 11, createdAt: now, updatedAt: now },
      { event_id: 8, character_version_id: 12, createdAt: now, updatedAt: now },
      { event_id: 8, character_version_id: 13, createdAt: now, updatedAt: now },
      { event_id: 9, character_version_id: 10, createdAt: now, updatedAt: now },
      { event_id: 9, character_version_id: 13, createdAt: now, updatedAt: now },
      { event_id: 9, character_version_id: 15, createdAt: now, updatedAt: now },
      { event_id: 10, character_version_id: 10, createdAt: now, updatedAt: now },
      { event_id: 10, character_version_id: 11, createdAt: now, updatedAt: now },
      { event_id: 10, character_version_id: 13, createdAt: now, updatedAt: now },
      { event_id: 10, character_version_id: 15, createdAt: now, updatedAt: now },
      { event_id: 11, character_version_id: 10, createdAt: now, updatedAt: now },
      { event_id: 11, character_version_id: 11, createdAt: now, updatedAt: now },
      { event_id: 11, character_version_id: 12, createdAt: now, updatedAt: now },
      { event_id: 11, character_version_id: 13, createdAt: now, updatedAt: now },
      { event_id: 11, character_version_id: 14, createdAt: now, updatedAt: now },
      { event_id: 12, character_version_id: 16, createdAt: now, updatedAt: now },
      { event_id: 12, character_version_id: 20, createdAt: now, updatedAt: now },
      { event_id: 12, character_version_id: 21, createdAt: now, updatedAt: now },
      { event_id: 13, character_version_id: 17, createdAt: now, updatedAt: now },
      { event_id: 13, character_version_id: 23, createdAt: now, updatedAt: now },
      { event_id: 13, character_version_id: 16, createdAt: now, updatedAt: now },
      { event_id: 13, character_version_id: 19, createdAt: now, updatedAt: now },
      { event_id: 14, character_version_id: 16, createdAt: now, updatedAt: now },
      { event_id: 14, character_version_id: 20, createdAt: now, updatedAt: now },
      { event_id: 14, character_version_id: 22, createdAt: now, updatedAt: now },
      { event_id: 14, character_version_id: 21, createdAt: now, updatedAt: now },
      { event_id: 15, character_version_id: 16, createdAt: now, updatedAt: now },
      { event_id: 15, character_version_id: 22, createdAt: now, updatedAt: now },
      { event_id: 16, character_version_id: 16, createdAt: now, updatedAt: now },
      { event_id: 16, character_version_id: 20, createdAt: now, updatedAt: now },
      { event_id: 16, character_version_id: 21, createdAt: now, updatedAt: now }
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
    await queryInterface.bulkDelete('sagas', null, {});
  }
};
