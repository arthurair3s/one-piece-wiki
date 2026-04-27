import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { CreateIslandCommand } from '../impl/create-island.command';
import { Island } from '../../models/island.model';
import { Arc } from 'src/arcs/models/arc.model';

@CommandHandler(CreateIslandCommand)
export class CreateIslandHandler
  implements ICommandHandler<CreateIslandCommand>
{
  constructor(
    @InjectModel(Island)
    private readonly islandModel: typeof Island,

    @InjectModel(Arc)
    private readonly arcModel: typeof Arc,
  ) {}

  async execute(command: CreateIslandCommand): Promise<Island> {
    const {
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

    // REGRA 1 — validar arc
    const arc = await this.arcModel.findByPk(arc_id);
    if (!arc) {
      throw new NotFoundException('Arc não encontrado');
    }

    // REGRA 2 — evitar nome duplicado no mesmo arc
    const existingIsland = await this.islandModel.findOne({
      where: { name, arc_id },
    });

    if (existingIsland) {
      throw new BadRequestException(
        'Já existe uma ilha com esse nome neste arco',
      );
    }

    // criação
    const island = await this.islandModel.create({
      name,
      description,
      arc_id,
      coordinate_x,
      coordinate_y,
      coordinate_z,
      model_url,
      thumbnail_url,
      is_active: is_active ?? true,
    });

    return island;
  }
}