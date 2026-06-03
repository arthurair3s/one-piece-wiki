import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateEventCommand } from '../impl/update-event.command';
import { Event } from '../../models/event.model';
import { ArcIsland } from '../../../arcs/models/arc-island.model';

@CommandHandler(UpdateEventCommand)
export class UpdateEventHandler implements ICommandHandler<UpdateEventCommand> {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(ArcIsland)
    private readonly arcIslandModel: typeof ArcIsland,
  ) {}

  async execute(command: UpdateEventCommand): Promise<Event> {
    const { id, arcIslandId, ...data } = command;

    const event = await this.eventModel.findByPk(id);
    if (!event) {
      throw new NotFoundException(`Event com ID ${id} não encontrado.`);
    }

    let updateData: any = { ...data };

    if (arcIslandId) {
      const arcIsland = await this.arcIslandModel.findByPk(arcIslandId);
      
      if (!arcIsland) {
        throw new NotFoundException(`Contexto arco-ilha com ID ${arcIslandId} não encontrado.`);
      }

      updateData.arc_island_id = arcIslandId;
    }

    return event.update(updateData);
  }
}
