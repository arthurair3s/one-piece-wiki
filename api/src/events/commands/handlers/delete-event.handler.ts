import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { DeleteEventCommand } from '../impl/delete-event.command';
import { Event } from '../../models/event.model';

@CommandHandler(DeleteEventCommand)
export class DeleteEventHandler implements ICommandHandler<DeleteEventCommand> {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
  ) {}

  async execute(command: DeleteEventCommand): Promise<void> {
    const { id } = command;

    const event = await this.eventModel.findByPk(id);
    if (!event) {
      throw new NotFoundException(`Event com ID ${id} não encontrado.`);
    }

    await event.destroy();
  }
}
