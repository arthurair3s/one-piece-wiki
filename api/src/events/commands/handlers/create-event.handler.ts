import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { CreateEventCommand } from '../impl/create-event.command';
import { Event } from '../../models/event.model';
import { Island } from '../../../islands/models/island.model';
import { ConflictException, NotFoundException } from '@nestjs/common';

@CommandHandler(CreateEventCommand)
export class CreateEventHandler implements ICommandHandler<CreateEventCommand> {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(Island)
    private readonly islandModel: typeof Island,
  ) {}

  async execute(command: CreateEventCommand): Promise<Event> {
    const { island_id, title, type, description, order } = command;
    
    // ilha deve existir
    const island = await this.islandModel.findByPk(island_id);
    if (!island) {
      throw new NotFoundException(`Island com ID ${island_id} não encontrada.`);
    }

    // impede duplicidade de ordem na mesma ilha
    const existing = await this.eventModel.findOne({
      where: { island_id, order },
    });

    if (existing) {
      throw new ConflictException(
        `Já existe um evento com a ordem ${order} nesta ilha.`,
      );
    }

    return this.eventModel.create({
      island_id,
      title,
      type,
      description,
      order,
    });
  }
}
