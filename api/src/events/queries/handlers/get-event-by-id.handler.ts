import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { GetEventByIdQuery } from '../impl/get-event-by-id.query';
import { EventRead } from '../../models/event-read.model';
import { CharacterVersionRead } from '../../../character-versions/models/character-version-read.model';
import { CharacterRead } from '../../../characters/models/character-read.model';

@QueryHandler(GetEventByIdQuery)
export class GetEventByIdHandler implements IQueryHandler<GetEventByIdQuery> {
  constructor(
    @InjectModel(EventRead, 'read-db')
    private readonly eventReadModel: typeof EventRead,
  ) {}

  async execute(query: GetEventByIdQuery): Promise<any> {
    const event = await this.eventReadModel.findByPk(query.id, {
      include: [
        {
          model: CharacterVersionRead,
          as: 'participants',
          through: { attributes: [] },
          include: [{ model: CharacterRead }],
        },
      ],
    });

    if (!event) {
      throw new NotFoundException(`Evento com ID ${query.id} não encontrado.`);
    }
    return event;
  }
}
