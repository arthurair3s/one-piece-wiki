import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { CreateEventCommand } from '../impl/create-event.command';
import { Event } from '../../models/event.model';
import { ArcIsland } from '../../../arcs/models/arc-island.model';
import { ConflictException, NotFoundException } from '@nestjs/common';

@CommandHandler(CreateEventCommand)
export class CreateEventHandler implements ICommandHandler<CreateEventCommand> {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(ArcIsland)
    private readonly arcIslandModel: typeof ArcIsland,
  ) { }

  async execute(command: CreateEventCommand): Promise<Event> {
    const { arcIslandId, title, type, description, order } = command;

    const arcIsland = await this.arcIslandModel.findByPk(arcIslandId);

    if (!arcIsland) {
      throw new NotFoundException(`Contexto (arcIslandId) ${arcIslandId} não encontrado.`);
    }

    // impede duplicidade de ordem na mesma ilha
    const existing = await this.eventModel.findOne({
      where: { arc_island_id: arcIslandId, order },
    });

    if (existing) {
      throw new ConflictException(
        `Já existe um evento com a ordem ${order} neste contexto arco-ilha.`,
      );
    }

    return this.eventModel.create({
      arc_island_id: arcIslandId,
      title,
      type,
      description,
      order,
    });
  }
}
