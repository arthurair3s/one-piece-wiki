import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { UniqueConstraintError, Op } from 'sequelize';

import { CreateIslandsBulkCommand } from '../impl/create-islands-bulk.command';
import { Island } from '../../models/island.model';
import { Arc } from '../../../arcs/models/arc.model';
import { ArcIsland } from '../../../arcs/models/arc-island.model';

@CommandHandler(CreateIslandsBulkCommand)
export class CreateIslandsBulkHandler implements ICommandHandler<CreateIslandsBulkCommand> {
  constructor(
    @InjectModel(Island)
    private readonly islandModel: typeof Island,
    @InjectModel(Arc)
    private readonly arcModel: typeof Arc,
    @InjectModel(ArcIsland)
    private readonly arcIslandModel: typeof ArcIsland,
    private readonly sequelize: Sequelize,
  ) {}

  async execute(command: CreateIslandsBulkCommand): Promise<Island[]> {
    const { islands } = command;

    // 1. Validar arcos de forma performática
    const allArcIds = [...new Set(islands.flatMap(i => i.arc_ids || []))];
    if (allArcIds.length > 0) {
      const foundArcs = await this.arcModel.findAll({
        where: { id: { [Op.in]: allArcIds } }
      });
      if (foundArcs.length !== allArcIds.length) {
        const foundIds = foundArcs.map(a => a.id);
        const missingIds = allArcIds.filter(id => !foundIds.includes(id));
        throw new NotFoundException(`Arcos com IDs [${missingIds.join(', ')}] não encontrados.`);
      }
    }

    // 2. Execução Transacional
    return this.sequelize.transaction(async (t) => {
      try {
        const createdIslands: Island[] = [];

        // Rastreia a próxima ordem disponível para cada arco neste lote
        const arcOrderMap = new Map<number, number>();

        // Busca ordens atuais no banco para inicializar o mapa
        if (allArcIds.length > 0) {
          const currentMaxOrders = await this.arcIslandModel.findAll({
            attributes: [
              'arc_id',
              [Sequelize.fn('MAX', Sequelize.col('order')), 'maxOrder']
            ],
            where: { arc_id: { [Op.in]: allArcIds } },
            group: ['arc_id'],
            transaction: t
          });

          currentMaxOrders.forEach((item: any) => {
            arcOrderMap.set(item.arc_id, Number(item.get('maxOrder')));
          });
        }

        for (const dto of islands) {
          const island = await this.islandModel.create({
            name: dto.name,
            description: dto.description,
            coordinate_x: dto.coordinate_x,
            coordinate_y: dto.coordinate_y,
            coordinate_z: dto.coordinate_z,
            model_url: dto.model_url,
            thumbnail_url: dto.thumbnail_url,
            is_active: dto.is_active ?? true,
          }, { transaction: t });

          if (dto.arc_ids && dto.arc_ids.length > 0) {
            const pivots = dto.arc_ids.map((arc_id) => {
              // Incrementa e obtém a ordem
              const nextOrder = (arcOrderMap.get(arc_id) || 0) + 1;
              arcOrderMap.set(arc_id, nextOrder);

              return {
                arc_id,
                island_id: island.id,
                order: nextOrder,
              };
            });
            await this.arcIslandModel.bulkCreate(pivots, { transaction: t });
          }

          createdIslands.push(island);
        }

        return createdIslands;
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new ConflictException(
            'Erro ao criar ilhas em lote: Conflito de nome ou vínculos duplicados.',
          );
        }
        throw error;
      }
    });
  }
}
