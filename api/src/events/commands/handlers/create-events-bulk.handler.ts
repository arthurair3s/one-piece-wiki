import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { UniqueConstraintError, Op } from 'sequelize';

import { CreateEventsBulkCommand } from '../impl/create-events-bulk.command';
import { Event } from '../../models/event.model';
import { Island } from '../../../islands/models/island.model';

@CommandHandler(CreateEventsBulkCommand)
export class CreateEventsBulkHandler implements ICommandHandler<CreateEventsBulkCommand> {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(Island)
    private readonly islandModel: typeof Island,
    private readonly sequelize: Sequelize,
  ) {}

  async execute(command: CreateEventsBulkCommand): Promise<Event[]> {
    const { events } = command;

    // validar ilhas
    const islandIds = [...new Set(events.map(e => e.island_id))];
    const foundIslands = await this.islandModel.findAll({
      where: { id: { [Op.in]: islandIds } }
    });

    if (foundIslands.length !== islandIds.length) {
      const foundIds = foundIslands.map(i => i.id);
      const missingIds = islandIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Ilhas com IDs [${missingIds.join(', ')}] não encontradas.`);
    }

    return this.sequelize.transaction(async (t) => {
      try {
        return await this.eventModel.bulkCreate(events as any, { 
          transaction: t,
          validate: true 
        });
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new ConflictException(
            'Erro ao criar eventos em lote: Conflito de ordem na mesma ilha.',
          );
        }
        throw error;
      }
    });
  }
}
