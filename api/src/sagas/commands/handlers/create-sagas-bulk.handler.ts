import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { ConflictException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { UniqueConstraintError } from 'sequelize';

import { CreateSagasBulkCommand } from '../impl/create-sagas-bulk.command';
import { Saga } from '../../models/saga.model';

@CommandHandler(CreateSagasBulkCommand)
export class CreateSagasBulkHandler implements ICommandHandler<CreateSagasBulkCommand> {
  constructor(
    @InjectModel(Saga)
    private readonly sagaModel: typeof Saga,
    private readonly sequelize: Sequelize,
  ) {}

  async execute(command: CreateSagasBulkCommand): Promise<Saga[]> {
    const { sagas } = command;

    return this.sequelize.transaction(async (t) => {
      try {
        return await this.sagaModel.bulkCreate(sagas as any, { 
          transaction: t,
          validate: true 
        });
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new ConflictException(
            'Erro ao criar sagas em lote: Conflito de nome ou ordem em um dos registros.',
          );
        }
        throw error;
      }
    });
  }
}
