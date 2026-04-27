import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { UpdateIslandCommand } from '../impl/update-island.command';
import { Island } from '../../models/island.model';
import { Arc } from 'src/arcs/models/arc.model';

@CommandHandler(UpdateIslandCommand)
export class UpdateIslandHandler
  implements ICommandHandler<UpdateIslandCommand>
{
  constructor(
    @InjectModel(Island)
    private readonly islandModel: typeof Island,

    @InjectModel(Arc)
    private readonly arcModel: typeof Arc,
  ) {}

  async execute(command: UpdateIslandCommand): Promise<Island> {
    const {
      id,
      name,
      description,
      arc_id,
      coordinate_x,
      coordinate_y,
      coordinate_z,
      model_url,
      thumbnail_url,
      is_active,
    } = command;

    // REGRA 1 — island deve existir
    const island = await this.islandModel.findByPk(id);
    if (!island) {
      throw new NotFoundException('Island não encontrada');
    }

    // REGRA 2 — definir arc alvo (caso mude)
    let targetArcId = island.arc_id;

    if (arc_id !== undefined && arc_id !== island.arc_id) {
      const arc = await this.arcModel.findByPk(arc_id);
      if (!arc) {
        throw new NotFoundException('Arc não encontrado');
      }

      targetArcId = arc_id;
    }

    // REGRA 3 — validar nome único dentro do arc
    if (name !== undefined) {
      const existing = await this.islandModel.findOne({
        where: {
          name,
          arc_id: targetArcId,
        },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          'Já existe uma ilha com esse nome neste arco',
        );
      }
    }

    // update
    await island.update({
      name: name ?? island.name,
      description: description ?? island.description,
      arc_id: targetArcId,
      coordinate_x: coordinate_x ?? island.coordinate_x,
      coordinate_y: coordinate_y ?? island.coordinate_y,
      coordinate_z: coordinate_z ?? island.coordinate_z,
      model_url: model_url ?? island.model_url,
      thumbnail_url: thumbnail_url ?? island.thumbnail_url,
      is_active: is_active ?? island.is_active,
    });

    return island;
  }
}