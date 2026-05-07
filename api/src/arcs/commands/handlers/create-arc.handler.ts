import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';

import { CreateArcCommand } from '../impl/create-arc.command';
import { Arc } from '../../models/arc.model';
import { Saga } from '../../../sagas/models/saga.model';

@CommandHandler(CreateArcCommand)
export class CreateArcHandler implements ICommandHandler<CreateArcCommand> {
  constructor(
    @InjectModel(Arc)
    private readonly arcModel: typeof Arc,

    @InjectModel(Saga)
    private readonly sagaModel: typeof Saga,
  ) {}

  async execute(command: CreateArcCommand): Promise<Arc> {
    const { name, description, saga_id, order } = command;

    // validação da existência da saga
    const saga = await this.sagaModel.findByPk(saga_id);
    if (!saga) {
      throw new NotFoundException(`Saga com ID ${saga_id} não encontrada.`);
    }

    try {
      return await this.arcModel.create({
        name,
        description,
        saga_id,
        order,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException(
          `Já existe um arco com o nome "${name}" ou ordem "${order}" nesta saga.`,
        );
      }
      throw error;
    }
  }
}