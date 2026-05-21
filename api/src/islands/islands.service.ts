import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateIslandDto } from './dtos/create-island.dto';
import { UpdateIslandDto } from './dtos/update-island.dto';
import { FilterIslandDto } from './dtos/filter-island.dto';

import { CreateIslandCommand } from './commands/impl/create-island.command';
import { CreateIslandsBulkCommand } from './commands/impl/create-islands-bulk.command';
import { UpdateIslandCommand } from './commands/impl/update-island.command';
import { DeleteIslandCommand } from './commands/impl/delete-island.command';

import { GetIslandDetailsQuery } from './queries/impl/get-island-details.query';
import { GetIslandsQuery } from './queries/impl/get-islands.query';
import { GetIslandArcsQuery } from './queries/impl/get-island-arcs.query';
import { GetIslandsMapQuery } from './queries/impl/get-islands-map.query';

@Injectable()
export class IslandsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // CREATE
  async create(dto: CreateIslandDto) {
    return this.commandBus.execute(
      new CreateIslandCommand(
        dto.name,
        dto.description,
        dto.arc_ids,
        dto.coordinate_x,
        dto.coordinate_y,
        dto.coordinate_z,
        dto.model_url,
        dto.thumbnail_url,
        dto.is_active,
      ),
    );
  }

  // BULK CREATE
  async createBulk(dtos: CreateIslandDto[]) {
    return this.commandBus.execute(
      new CreateIslandsBulkCommand(dtos),
    );
  }

  // LIST (MAP / FILTER)
  async findAll(query: FilterIslandDto) {
    return this.queryBus.execute(
      new GetIslandsQuery(
        query.page ?? 1,
        query.limit ?? 10,
        query.arc_id,
        query.is_active,
      ),
    );
  }

  // MAPA
  async getMap() {
    return this.queryBus.execute(new GetIslandsMapQuery());
  }

  // ARCOS DA ILHA
  async getArcs(islandId: number) {
    return this.queryBus.execute(
      new GetIslandArcsQuery(islandId),
    );
  }

  // DETAILS
  async findDetails(id: number, arcId: number) {
    return this.queryBus.execute(
      new GetIslandDetailsQuery(id, arcId),
    );
  }

  // UPDATE
  async update(id: number, dto: UpdateIslandDto) {
    return this.commandBus.execute(
      new UpdateIslandCommand(
        id,
        dto.name,
        dto.description,
        dto.arc_ids,
        dto.coordinate_x,
        dto.coordinate_y,
        dto.coordinate_z,
        dto.model_url,
        dto.thumbnail_url,
        dto.is_active,
      ),
    );
  }

  // DELETE (soft)
  async remove(id: number) {
    return this.commandBus.execute(
      new DeleteIslandCommand(id),
    );
  }
}