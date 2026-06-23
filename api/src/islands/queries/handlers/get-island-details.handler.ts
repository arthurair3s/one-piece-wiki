import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { GetIslandDetailsQuery } from '../impl/get-island-details.query';

import { IslandRead } from '../../models/island-read.model';
import { ArcIslandRead } from '../../../arcs/models/arc-island-read.model';
import { ArcCharacterVersionRead } from '../../../arcs/models/arc-character-version-read.model';
import { CharacterVersionRead } from '../../../character-versions/models/character-version-read.model';
import { CharacterRead } from '../../../characters/models/character-read.model';
import { EventRead } from '../../../events/models/event-read.model';

@QueryHandler(GetIslandDetailsQuery)
export class GetIslandDetailsHandler
  implements IQueryHandler<GetIslandDetailsQuery>
{
  constructor(
    @InjectModel(IslandRead, 'read-db')
    private readonly islandModel: typeof IslandRead,
    @InjectModel(ArcIslandRead, 'read-db')
    private readonly arcIslandModel: typeof ArcIslandRead,
    @InjectModel(ArcCharacterVersionRead, 'read-db')
    private readonly arcCharacterVersionModel: typeof ArcCharacterVersionRead,
  ) {}

  async execute(query: GetIslandDetailsQuery) {
    const { islandId, arcId } = query;

    if (!arcId) {
      throw new BadRequestException('arc_id é obrigatório');
    }

    const island = await this.islandModel.findByPk(islandId);

    if (!island || island.is_active === false) {
      throw new NotFoundException('Island não encontrada');
    }

    // Buscar a relação ArcIsland
    const arcIsland = await this.arcIslandModel.findOne({
      where: { island_id: islandId, arc_id: arcId },
      include: [
        {
          model: EventRead,
          attributes: ['id', 'title', 'description', 'order'],
        },
      ],
    });

    if (!arcIsland) {
      throw new BadRequestException('Este arco não pertence à ilha');
    }

    // Buscar personagens do Arco
    const arcCharacters = await this.arcCharacterVersionModel.findAll({
      where: { arc_id: arcId },
      include: [
        {
          model: CharacterVersionRead,
          include: [
            {
              model: CharacterRead,
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    const characters = arcCharacters.map((acv: any) => ({
      id: acv.characterVersion.id,
      characterId: acv.characterVersion.character_id,
      name: acv.characterVersion.alias || acv.characterVersion.character?.name,
      epithet: acv.characterVersion.epithet,
      image: acv.characterVersion.image_url,
      bounty: acv.characterVersion.bounty,
      status: acv.characterVersion.status,
    }));

    const events = (arcIsland.events || [])
      .sort((a, b) => a.order - b.order)
      .map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description,
      }));

    return {
      id: island.id,
      name: island.name,
      description: island.description,

      coordinates: {
        x: island.coordinate_x,
        y: island.coordinate_y,
        z: island.coordinate_z,
      },

      arc: {
        id: arcId,
      },

      characters,
      events,
    };
  }
}