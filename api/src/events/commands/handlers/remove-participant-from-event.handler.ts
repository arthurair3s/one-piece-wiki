import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { RemoveParticipantFromEventCommand } from '../impl/remove-participant-from-event.command';
import { EventParticipant } from '../../models/event-participant.model';

@CommandHandler(RemoveParticipantFromEventCommand)
export class RemoveParticipantFromEventHandler
  implements ICommandHandler<RemoveParticipantFromEventCommand>
{
  constructor(
    @InjectModel(EventParticipant)
    private readonly eventParticipantModel: typeof EventParticipant,
  ) {}

  async execute(command: RemoveParticipantFromEventCommand): Promise<void> {
    const { event_id, character_version_id } = command;

    const participant = await this.eventParticipantModel.findOne({
      where: { event_id, character_version_id },
    });

    if (!participant) {
      throw new NotFoundException('Participante não encontrado neste evento');
    }

    await participant.destroy();
  }
}
