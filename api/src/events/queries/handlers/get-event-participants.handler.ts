import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { GetEventParticipantsQuery } from '../impl/get-event-participants.query';
import { EventRead } from '../../models/event-read.model';
import { CharacterVersionRead } from '../../../character-versions/models/character-version-read.model';
import { CharacterRead } from '../../../characters/models/character-read.model';

@QueryHandler(GetEventParticipantsQuery)
export class GetEventParticipantsHandler
  implements IQueryHandler<GetEventParticipantsQuery> {
  constructor(
    @InjectModel(EventRead, 'read-db')
    private readonly eventReadModel: typeof EventRead,
  ) { }

  async execute(query: GetEventParticipantsQuery) {
    const { event_id } = query;

    const event = await this.eventReadModel.findByPk(event_id, {
      include: [
        {
          model: CharacterVersionRead,
          through: { attributes: [] },
          include: [{ model: CharacterRead }],
        },
      ],
    });

    if (!event) {
      throw new NotFoundException(`Evento com ID ${event_id} não encontrado`);
    }

    return event.participants;
  }
}
