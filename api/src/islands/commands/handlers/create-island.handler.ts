import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { UniqueConstraintError, Op } from 'sequelize';

import { CreateIslandCommand } from '../impl/create-island.command';
import { Island } from '../../models/island.model';
import { Arc } from '../../../arcs/models/arc.model';
import { ArcIsland } from '../../../arcs/models/arc-island.model';

@CommandHandler(CreateIslandCommand)
export class CreateIslandHandler
  implements ICommandHandler<CreateIslandCommand>
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

  async execute(command: CreateIslandCommand): Promise<Island> {
    const {
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

    // valida existência de todos os arcos
    for (const assoc of arc_ids) {
      const arc = await this.arcModel.findByPk(assoc.arc_id);
      if (!arc) {
        throw new NotFoundException(`Arco com ID ${assoc.arc_id} não encontrado`);
      }
    }

    return this.sequelize.transaction(async (t) => {
      try {
        // cria a ilha
        const island = await this.islandModel.create({
          name,
          description,
          coordinate_x,
          coordinate_y,
          coordinate_z,
          model_url,
          thumbnail_url,
          is_active: is_active ?? true,
        }, { transaction: t });

        // vincula a ilha aos arcos via pivot preservando a ordem
        if (arc_ids && arc_ids.length > 0) {
          const pivots = arc_ids.map((assoc) => {
            return {
              arc_id: assoc.arc_id,
              island_id: island.id,
              order: assoc.order,
            };
          });

          await this.arcIslandModel.bulkCreate(pivots, { transaction: t });
        }

        return island;
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new ConflictException(`Já existe uma ilha com o nome "${name}" ou conflito de vínculos.`);
        }
        throw error;
      }
    });
  }
}