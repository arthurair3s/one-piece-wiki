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
          // busca e valida se os arcos informados existem
          const targetArcIds = arc_ids.map(a => a.arc_id);
          const foundArcs = await this.arcModel.findAll({
            where: { id: { [Op.in]: targetArcIds } },
            transaction: t
          });
          if (foundArcs.length !== targetArcIds.length) {
            const foundIds = foundArcs.map(a => a.id);
            const missingIds = targetArcIds.filter(id => !foundIds.includes(id));
            throw new NotFoundException(`Arcos com IDs [${missingIds.join(', ')}] não encontrados.`);
          }

          const pivots = arc_ids.map((assoc) => {
            return {
              arc_id: assoc.arc_id,
              island_id: id,
              order: assoc.order,
            };
          });
          await this.arcIslandModel.bulkCreate(pivots, { transaction: t });
        }
      }

      return island;
    });
  }
}