import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { DeleteEventCommand } from '../impl/delete-event.command';
import { Event } from '../../models/event.model';
import { EventParticipant } from '../../models/event-participant.model';
import { Sequelize } from 'sequelize-typescript';

@CommandHandler(DeleteEventCommand)
export class DeleteEventHandler implements ICommandHandler<DeleteEventCommand> {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(EventParticipant)
    private readonly eventParticipantModel: typeof EventParticipant,
    private readonly sequelize: Sequelize,
  ) {}

  async execute(command: DeleteEventCommand): Promise<void> {
    const { id } = command;

    const event = await this.eventModel.findByPk(id);
    if (!event) {
      throw new NotFoundException(`Event com ID ${id} não encontrado.`);
    }

    await this.sequelize.transaction(async (t) => {
      await this.eventParticipantModel.destroy({
        where: { event_id: id },
        transaction: t,
      });

      await event.destroy({ transaction: t });
    });
  }
}
