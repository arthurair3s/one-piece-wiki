import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';

import { GetIslandDetailsQuery } from '../impl/get-island-details.query';

import { Island } from '../../models/island.model';
import { Arc } from 'src/arcs/models/arc.model';
import { CharacterVersion } from 'src/character-versions/models/character-version.model';
import { Character } from 'src/characters/models/character.model';
import { Event } from 'src/events/models/event.model';

@QueryHandler(GetIslandDetailsQuery)
export class GetIslandDetailsHandler
  implements IQueryHandler<GetIslandDetailsQuery>
{
  constructor(
    @InjectModel(Island)
    private readonly islandModel: typeof Island,
  ) {}

  async execute(query: GetIslandDetailsQuery) {
    const { id } = query;

    const island = await this.islandModel.findByPk(id, {
        include: [
            {
            model: Arc,
            attributes: ['id', 'name'],
            },
            {
            model: CharacterVersion,
            attributes: ['id', 'image_url', 'bounty', 'status'],
            include: [
                {
                model: Character,
                attributes: ['id', 'name', 'epithet'],
                },
            ],
            },
            {
            model: Event,
            attributes: ['id', 'title', 'description', 'order'],
            },
        ],
    });

    if (!island || island.is_active === false) {
      throw new NotFoundException('Island não encontrada');
    }

    return {
      id: island.id,
      name: island.name,
      description: island.description,
      model_url: island.model_url,
      thumbnail_url: island.thumbnail_url,

      coordinates: {
        x: island.coordinate_x,
        y: island.coordinate_y,
        z: island.coordinate_z,
      },

      arc: island.arc,

      characters:
        island.character_versions?.map((cv) => ({
          id: cv.character.id,
          name: cv.character.name,
          epithet: cv.epithet,
          image: cv.image_url,
          bounty: cv.bounty,
          status: cv.status,
        })) ?? [],


      events:
        island.events
            ?.sort((a, b) => a.order - b.order)
            .map((e) => ({
                id: e.id,
                title: e.title,
                description: e.description,
            })) ?? [],
        };
  }
}