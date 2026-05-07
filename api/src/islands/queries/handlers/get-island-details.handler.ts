import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

import { GetIslandDetailsQuery } from '../impl/get-island-details.query';

import { Island } from '../../models/island.model';
import { Arc } from '../../../arcs/models/arc.model';
import { CharacterVersion } from '../../../character-versions/models/character-version.model';
import { Character } from '../../../characters/models/character.model';
import { Event } from '../../../events/models/event.model';
import { IslandCharacterVersion } from 'src/island-character-versions/models/island-character-version.model';

@QueryHandler(GetIslandDetailsQuery)
export class GetIslandDetailsHandler
  implements IQueryHandler<GetIslandDetailsQuery>
{
  constructor(
    @InjectModel(Island)
    private readonly islandModel: typeof Island,
  ) {}

  async execute(query: GetIslandDetailsQuery) {
    const { islandId, arcId } = query;

    if (!arcId) {
      throw new BadRequestException('arc_id é obrigatório');
    }

    const island: any = await this.islandModel.findByPk(islandId, {
      include: [
        {
          model: Arc,
          attributes: ['id', 'name'],
        },
        {
          model: IslandCharacterVersion,
          include: [
            {
              model: CharacterVersion,
              include: [
                {
                  model: Arc,
                },
                {
                  model: Character,
                  attributes: ['id', 'name'],
                },
              ],
            },
          ],
        },
        {
          model: Event,
          attributes: ['id', 'title', 'description', 'order'],
        },
      ],
    });

    const hasArc = island.arcs?.some(a => a.id === arcId);

    if (!hasArc) {
      throw new BadRequestException('Este arco não pertence à ilha');
    }
    
    if (!island || island.is_active === false) {
      throw new NotFoundException('Island não encontrada');
    }

    const characters = (island.island_character_versions || [])
      .filter((icv: any) =>
        icv.characterVersion?.arcs?.some((a: any) => a.id === arcId),
      )
      .map((icv: any) => ({
        id: icv.characterVersion.id,
        name:
          icv.characterVersion.alias ||
          icv.characterVersion.character?.name,
        epithet: icv.characterVersion.epithet,
        image: icv.characterVersion.image_url,
        bounty: icv.characterVersion.bounty,
        status: icv.characterVersion.status,
      }));

    const events = (island.events || [])
      .sort((a, b) => a.order - b.order)
      .map((e) => ({
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