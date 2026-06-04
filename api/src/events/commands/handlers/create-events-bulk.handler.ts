import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { UniqueConstraintError, Op } from 'sequelize';

import { CreateEventsBulkCommand } from '../impl/create-events-bulk.command';
import { Event } from '../../models/event.model';
import { ArcIsland } from '../../../arcs/models/arc-island.model';

@CommandHandler(CreateEventsBulkCommand)
export class CreateEventsBulkHandler implements ICommandHandler<CreateEventsBulkCommand> {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(ArcIsland)
    private readonly arcIslandModel: typeof ArcIsland,
    private readonly sequelize: Sequelize,
  ) {}

  async execute(command: CreateEventsBulkCommand): Promise<Event[]> {
    const { events } = command;

    const arcIslandIds = [...new Set(events.map(e => e.arcIslandId))];
    const foundArcIslands: any[] = await this.arcIslandModel.findAll({
      where: { id: { [Op.in]: arcIslandIds } },
    });

    if (foundArcIslands.length !== arcIslandIds.length) {
      const foundIds = foundArcIslands.map(i => i.id);
      const missingIds = arcIslandIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Contextos (arc_island_id) [${missingIds.join(', ')}] não encontrados.`);
    }

    return this.sequelize.transaction(async (t) => {
      try {
        const eventsToCreate = events.map(e => ({
          ...e,
          arc_island_id: e.arcIslandId,
        }));
        return await this.eventModel.bulkCreate(eventsToCreate as any, { 
          transaction: t,
          validate: true 
        });
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new ConflictException(
            'Erro ao criar eventos em lote: Conflito de ordem no mesmo contexto arco-ilha.',
          );
        }
        throw error;
      }
    });
  }
}
