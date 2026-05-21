import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateSagaDto } from './dtos/create-saga-dto';
import { UpdateSagaDto } from './dtos/update-saga-dto';
import { FilterSagaDto } from './dtos/filter-saga-dto';

import { CreateSagaCommand } from './commands/impl/create-saga.command';
import { CreateSagasBulkCommand } from './commands/impl/create-sagas-bulk.command';
import { UpdateSagaCommand } from './commands/impl/update-saga.command';
import { DeleteSagaCommand } from './commands/impl/delete-saga.command';

import { GetSagasQuery } from './queries/impl/get-sagas.query';
import { GetSagaByIdQuery } from './queries/impl/get-saga-by-id.query';

@Injectable()
export class SagasService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // CREATE
  async create(dto: CreateSagaDto) {
    return this.commandBus.execute(
      new CreateSagaCommand(dto.name, dto.order, dto.description),
    );
  }

  // BULK CREATE
  async createBulk(dtos: CreateSagaDto[]) {
    return this.commandBus.execute(
      new CreateSagasBulkCommand(dtos),
    );
  }

  // READ ALL (com paginação)
  async findAll(query: FilterSagaDto) {
    return this.queryBus.execute(
      new GetSagasQuery(query.page, query.limit, query.name, query.order),
    );
  }

  // READ ONE
  async findOne(id: number) {
    return this.queryBus.execute(
      new GetSagaByIdQuery(id),
    );
  }

  // UPDATE
  async update(id: number, dto: UpdateSagaDto) {
    return this.commandBus.execute(
      new UpdateSagaCommand(id, dto.name, dto.order),
    );
  }

  // DELETE
  async remove(id: number) {
    return this.commandBus.execute(
      new DeleteSagaCommand(id),
    );
  }
}