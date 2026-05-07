import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { AddParticipantToEventCommand } from '../impl/add-participant-to-event.command';
import { Event } from '../../models/event.model';
import { EventParticipant } from '../../models/event-participant.model';
import { CharacterVersion } from '../../../character-versions/models/character-version.model';

@CommandHandler(AddParticipantToEventCommand)
export class AddParticipantToEventHandler
  implements ICommandHandler<AddParticipantToEventCommand>
{
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,

    @InjectModel(CharacterVersion)
    private readonly characterVersionModel: typeof CharacterVersion,

    @InjectModel(EventParticipant)
    private readonly eventParticipantModel: typeof EventParticipant,
  ) {}

  async execute(command: AddParticipantToEventCommand): Promise<EventParticipant> {
    const { event_id, character_version_id } = command;

    const event = await this.eventModel.findByPk(event_id);
    if (!event) {
      throw new NotFoundException(`Evento com ID ${event_id} não encontrado`);
    }

    const characterVersion = await this.characterVersionModel.findByPk(character_version_id);
    if (!characterVersion) {
      throw new NotFoundException(`Versão de personagem com ID ${character_version_id} não encontrada`);
    }

    try {
      return await this.eventParticipantModel.create({ event_id, character_version_id });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Este personagem já está vinculado a este evento.');
      }
      throw error;
    }
  }
}
