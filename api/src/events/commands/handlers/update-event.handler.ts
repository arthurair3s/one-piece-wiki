import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { UpdateEventCommand } from '../impl/update-event.command';
import { Event } from '../../models/event.model';
import { Island } from '../../../islands/models/island.model';

@CommandHandler(UpdateEventCommand)
export class UpdateEventHandler implements ICommandHandler<UpdateEventCommand> {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(Island)
    private readonly islandModel: typeof Island,
  ) {}

  async execute(command: UpdateEventCommand): Promise<Event> {
    const { id, island_id, ...data } = command;

    const event = await this.eventModel.findByPk(id);
    if (!event) {
      throw new NotFoundException(`Event com ID ${id} não encontrado.`);
    }

    if (island_id) {
      const island = await this.islandModel.findByPk(island_id);
      if (!island) {
        throw new NotFoundException(`Island com ID ${island_id} não encontrada.`);
      }
    }

    return event.update({ island_id, ...data });
  }
}
