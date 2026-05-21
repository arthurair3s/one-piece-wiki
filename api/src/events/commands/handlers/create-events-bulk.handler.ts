import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { UniqueConstraintError, Op } from 'sequelize';

import { CreateEventsBulkCommand } from '../impl/create-events-bulk.command';
import { Event } from '../../models/event.model';
import { Island } from '../../../islands/models/island.model';
import { Arc } from '../../../arcs/models/arc.model';

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

    // validar ilhas e buscar seus arcos
    const islandIds = [...new Set(events.map(e => e.island_id))];
    const foundIslands: any[] = await this.islandModel.findAll({
      where: { id: { [Op.in]: islandIds } },
      include: [{ model: Arc, attributes: ['id', 'order'], through: { attributes: [] } }],
    });

    if (foundIslands.length !== islandIds.length) {
      const foundIds = foundIslands.map(i => i.id);
      const missingIds = islandIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Ilhas com IDs [${missingIds.join(', ')}] não encontradas.`);
    }

    // criar mapa de island_id -> arc_id válidos
    const islandArcMap: { [key: number]: number[] } = {};
    for (const island of foundIslands) {
      const arcIds = (island.arcs || []).map((a: any) => Number(a.id));
      if (arcIds.length === 0) {
        throw new ConflictException(
          `Não há arcos associados à ilha ${island.id}. Um evento deve ocorrer em um contexto de arco.`,
        );
      }
      islandArcMap[island.id] = arcIds;
    }

    // adicionar arc_id a cada evento: validar se foi passado, ou usar o de menor ID
    const eventsWithArcIds = events.map(e => {
      const validArcIds = islandArcMap[e.island_id];
      
      if (!e.arc_id) {
        throw new ConflictException(
          `O arc_id é obrigatório. Nenhum arco foi fornecido para o evento na ilha ${e.island_id}.`,
        );
      }

      // validar que pertence à ilha
      if (!validArcIds.includes(e.arc_id)) {
        throw new ConflictException(
          `O arco com ID ${e.arc_id} não está associado à ilha ${e.island_id}. Arcos disponíveis: [${validArcIds.join(', ')}].`,
        );
      }
      
      return e;
    });

    return this.sequelize.transaction(async (t) => {
      try {
        return await this.eventModel.bulkCreate(eventsWithArcIds as any, { 
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
