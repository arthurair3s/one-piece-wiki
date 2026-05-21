import { CreateSagaDto } from '../../dtos/create-saga-dto';

export class CreateSagasBulkCommand {
  constructor(public readonly sagas: CreateSagaDto[]) {}
}
