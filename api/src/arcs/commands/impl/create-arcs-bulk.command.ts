import { CreateArcDto } from '../../dtos/create-arcs-dto';

export class CreateArcsBulkCommand {
  constructor(public readonly arcs: CreateArcDto[]) {}
}
