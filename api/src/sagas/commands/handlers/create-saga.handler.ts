import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { ConflictException } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';

import { CreateSagaCommand } from '../impl/create-saga.command';
import { Saga } from 'src/sagas/models/saga.model';

@CommandHandler(CreateSagaCommand)
export class CreateSagaHandler implements ICommandHandler<CreateSagaCommand> {
  constructor(
    @InjectModel(Saga)
    private readonly sagaModel: typeof Saga,
  ) {}

  async execute(command: CreateSagaCommand): Promise<Saga> {
    const { name, order, description } = command;

    try {
      return await this.sagaModel.create({
        name,
        order,
        description,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException(
          `Já existe uma saga com este nome ou ordem de sequência (${name} / ${order}).`,
        );
      }
      throw error;
    }
  }
}