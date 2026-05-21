import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { GetCharacterQuery } from '../impl/get-character.query';
import { Character } from '../../models/character.model';
import { CharacterVersion } from '../../../character-versions/models/character-version.model';
import { Arc } from '../../../arcs/models/arc.model';

@QueryHandler(GetCharacterQuery)
export class GetCharacterHandler implements IQueryHandler<GetCharacterQuery> {
  constructor(
    @InjectModel(Character)
    private readonly characterModel: typeof Character,
  ) {}

  async execute(query: GetCharacterQuery) {
    const character: any = await this.characterModel.findByPk(query.id, {
      include: [
        {
          model: CharacterVersion,
          include: [{ 
            model: Arc, 
            attributes: ['id', 'name', 'description', 'saga_id', 'order'],
            through: { attributes: [] }
          }],
        },
      ],
    });

    if (!character) {
      throw new NotFoundException(`Personagem com ID ${query.id} não encontrado`);
    }

    // popula o current_status
    let latestArcOrder = -1;
    let latestStatus = 'UNKNOWN';

    character.versions?.forEach((version: any) => {
      version.arcs?.forEach((arc: any) => {
        if (arc.order > latestArcOrder) {
          latestArcOrder = arc.order;
          latestStatus = version.status;
        }
      });
    });

    character.setDataValue('current_status', latestStatus);

    return character;
  }
}
