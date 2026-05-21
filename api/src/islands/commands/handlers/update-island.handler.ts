import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

import { UpdateIslandCommand } from '../impl/update-island.command';
import { Island } from '../../models/island.model';
import { Arc } from '../../../arcs/models/arc.model';
import { ArcIsland } from '../../../arcs/models/arc-island.model';

@CommandHandler(UpdateIslandCommand)
export class UpdateIslandHandler
  implements ICommandHandler<UpdateIslandCommand>
{
  constructor(
    @InjectModel(Island)
    private readonly islandModel: typeof Island,

    @InjectModel(Arc)
    private readonly arcModel: typeof Arc,

    @InjectModel(ArcIsland)
    private readonly arcIslandModel: typeof ArcIsland,

    private readonly sequelize: Sequelize,
  ) {}

  async execute(command: UpdateIslandCommand): Promise<Island> {
    const {
      id,
      name,
      description,
      arc_ids,
      coordinate_x,
      coordinate_y,
      coordinate_z,
      model_url,
      thumbnail_url,
      is_active,
    } = command;

    const island = await this.islandModel.findByPk(id);
    if (!island) {
      throw new NotFoundException('Ilha não encontrada');
    }

    return this.sequelize.transaction(async (t) => {
      await island.update({
        name: name ?? island.name,
        description: description ?? island.description,
        coordinate_x: coordinate_x ?? island.coordinate_x,
        coordinate_y: coordinate_y ?? island.coordinate_y,
        coordinate_z: coordinate_z ?? island.coordinate_z,
        model_url: model_url ?? island.model_url,
        thumbnail_url: thumbnail_url ?? island.thumbnail_url,
        is_active: is_active ?? island.is_active,
      }, { transaction: t });

      if (arc_ids !== undefined) {
        // remove vínculos antigos
        await this.arcIslandModel.destroy({ 
          where: { island_id: id },
          transaction: t 
        });

        if (arc_ids.length > 0) {
          // busca ordens atuais para os arcos alvo
          const arcOrderMap = new Map<number, number>();
          const currentMaxOrders = await this.arcIslandModel.findAll({
            attributes: ['arc_id', [Sequelize.fn('MAX', Sequelize.col('order')), 'maxOrder']],
            where: { arc_id: { [Op.in]: arc_ids } },
            group: ['arc_id'],
            transaction: t
          });
          currentMaxOrders.forEach((item: any) => {
            arcOrderMap.set(item.arc_id, Number(item.get('maxOrder')));
          });

          const pivots = arc_ids.map((arc_id) => {
            const nextOrder = (arcOrderMap.get(arc_id) || 0) + 1;
            arcOrderMap.set(arc_id, nextOrder);
            return { arc_id, island_id: id, order: nextOrder };
          });
          await this.arcIslandModel.bulkCreate(pivots, { transaction: t });
        }
      }

      return island;
    });
  }
}