import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';

import { GetArcByIdQuery } from '../impl/get-arc-by-id.query';
import { Arc } from '../../models/arc.model';
import { Island } from '../../../islands/models/island.model';
import { CharacterVersion } from '../../../character-versions/models/character-version.model';
import { Character } from '../../../characters/models/character.model';

@QueryHandler(GetArcByIdQuery)
export class GetArcByIdHandler implements IQueryHandler<GetArcByIdQuery> {
  constructor(
    @InjectModel(Arc)
    private readonly arcModel: typeof Arc,
  ) {}

  async execute(query: GetArcByIdQuery): Promise<Arc> {
    const { id } = query;

    const arc = await this.arcModel.findByPk(id, {
      include: [
        {
          model: Island,
          through: { attributes: ['order'] }, // traz a ordem da ilha neste arco
          attributes: ['id', 'name', 'coordinate_x', 'coordinate_y', 'coordinate_z'],
        },
        {
          model: CharacterVersion,
          through: { attributes: ['order'] }, // traz a ordem do personagem neste arco
          attributes: ['id', 'character_id', 'alias', 'epithet', 'status', 'image_url'],
          include: [
            {
              model: Character,
              attributes: ['id', 'name'],
            }
          ]
        }
      ],
    });

    // validação: precisa existir
    if (!arc) {
      throw new NotFoundException('Arc não encontrado');
    }

    return arc;
  }
}