import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { GetEventParticipantsQuery } from '../impl/get-event-participants.query';
import { Event } from '../../models/event.model';
import { CharacterVersion } from '../../../character-versions/models/character-version.model';
import { Character } from '../../../characters/models/character.model';
import { EventParticipant } from '../../models/event-participant.model';

@QueryHandler(GetEventParticipantsQuery)
export class GetEventParticipantsHandler
  implements IQueryHandler<GetEventParticipantsQuery>
{
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
  ) {}

  async execute(query: GetEventParticipantsQuery) {
    const { event_id } = query;

    const event = await this.eventModel.findByPk(event_id, {
      include: [
        {
          model: CharacterVersion,
          through: { attributes: [] }, // oculta a tabela pivot
          include: [{ model: Character }],
        },
      ],
    });

    if (!event) {
      throw new NotFoundException(`Evento com ID ${event_id} não encontrado`);
    }

    return event.participants;
  }
}
