import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateArcDto } from './dtos/create-arcs-dto';
import { UpdateArcDto } from './dtos/update-arcs-dto';
import { FilterArcDto } from './dtos/filter-arcs-dto';

import { CreateArcCommand } from './commands/impl/create-arc.command';
import { CreateArcsBulkCommand } from './commands/impl/create-arcs-bulk.command';
import { UpdateArcCommand } from './commands/impl/update-arc.command';
import { DeleteArcCommand } from './commands/impl/delete-arc.command';

import { GetArcsQuery } from './queries/impl/get-arcs.query';
import { GetArcByIdQuery } from './queries/impl/get-arc-by-id.query';

@Injectable()
export class ArcsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  create(dto: CreateArcDto) {
    return this.commandBus.execute(
      new CreateArcCommand(
        dto.name,
        dto.description,
        dto.saga_id,
        dto.order,
      ),
    );
  }

  createBulk(dtos: CreateArcDto[]) {
    return this.commandBus.execute(
      new CreateArcsBulkCommand(dtos),
    );
  }

  findAll(query: FilterArcDto) {
    return this.queryBus.execute(
      new GetArcsQuery(query.page, query.limit, query.saga_id, query.name),
    );
  }

  findOne(id: number) {
    return this.queryBus.execute(
      new GetArcByIdQuery(id),
    );
  }

  update(id: number, dto: UpdateArcDto) {
    return this.commandBus.execute(
      new UpdateArcCommand(
        id,
        dto.name,
        dto.description,
        dto.saga_id,
        dto.order,
      ),
    );
  }

  remove(id: number) {
    return this.commandBus.execute(
      new DeleteArcCommand(id),
    );
  }
}