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
      rotation_y,
      scale,
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
        rotation_y: rotation_y ?? island.rotation_y,
        scale: scale ?? island.scale,
      }, { transaction: t });

      if (arc_ids !== undefined) {
        const targetArcIds = arc_ids.map(a => a.arc_id);

        // Busca e valida se os arcos informados existem
        if (targetArcIds.length > 0) {
          const foundArcs = await this.arcModel.findAll({
            where: { id: { [Op.in]: targetArcIds } },
            transaction: t
          });
          if (foundArcs.length !== targetArcIds.length) {
            const foundIds = foundArcs.map(a => a.id);
            const missingIds = targetArcIds.filter(id => !foundIds.includes(id));
            throw new NotFoundException(`Arcos com IDs [${missingIds.join(', ')}] não encontrados.`);
          }
        }

        // Remove (soft-delete) apenas os vínculos antigos que NÃO estão na nova lista
        await this.arcIslandModel.destroy({
          where: {
            island_id: id,
            arc_id: { [Op.notIn]: targetArcIds }
          },
          transaction: t
        });

        // Para os arcos solicitados, verifica se já existem (ativos ou soft-deletados)
        const existingPivots = await this.arcIslandModel.findAll({
          where: { island_id: id },
          paranoid: false,
          transaction: t
        });

        for (const assoc of arc_ids) {
          const existing = existingPivots.find(p => p.arc_id === assoc.arc_id);
          if (existing) {
            if (existing.deletedAt) {
              await existing.restore({ transaction: t });
            }
            await existing.update({ order: assoc.order }, { transaction: t });
          } else {
            await this.arcIslandModel.create({
              arc_id: assoc.arc_id,
              island_id: id,
              order: assoc.order,
            }, { transaction: t });
          }
        }
      }

      return island;
    });
  }
}