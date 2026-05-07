import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { GetEventByIdQuery } from '../impl/get-event-by-id.query';
import { Event } from '../../models/event.model';
import { CharacterVersion } from '../../../character-versions/models/character-version.model';
import { Character } from '../../../characters/models/character.model';

@QueryHandler(GetEventByIdQuery)
export class GetEventByIdHandler implements IQueryHandler<GetEventByIdQuery> {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
  ) {}

  async execute(query: GetEventByIdQuery): Promise<Event> {
    const event = await this.eventModel.findByPk(query.id, {
      include: [
        {
          model: CharacterVersion,
          as: 'participants',
          through: { attributes: [] },
          include: [{ model: Character }],
        },
      ],
    });

    if (!event) {
      throw new NotFoundException(`Evento com ID ${query.id} não encontrado.`);
    }
    return event;
  }
}
