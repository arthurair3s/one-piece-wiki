import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { UniqueConstraintError, Op } from 'sequelize';

import { CreateArcsBulkCommand } from '../impl/create-arcs-bulk.command';
import { Arc } from '../../models/arc.model';
import { Saga } from '../../../sagas/models/saga.model';

@CommandHandler(CreateArcsBulkCommand)
export class CreateArcsBulkHandler implements ICommandHandler<CreateArcsBulkCommand> {
  constructor(
    @InjectModel(Arc)
    private readonly arcModel: typeof Arc,
    @InjectModel(Saga)
    private readonly sagaModel: typeof Saga,
    private readonly sequelize: Sequelize,
  ) {}

  async execute(command: CreateArcsBulkCommand): Promise<Arc[]> {
    const { arcs } = command;

    // validação performática das sagas
    const sagaIds = [...new Set(arcs.map(a => a.saga_id))];
    const foundSagas = await this.sagaModel.findAll({
      where: { id: { [Op.in]: sagaIds } }
    });

    if (foundSagas.length !== sagaIds.length) {
      const foundIds = foundSagas.map(s => s.id);
      const missingIds = sagaIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Sagas com IDs [${missingIds.join(', ')}] não encontradas.`);
    }

    return this.sequelize.transaction(async (t) => {
      try {
        return await this.arcModel.bulkCreate(arcs as any, { 
          transaction: t,
          validate: true 
        });
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new ConflictException(
            'Erro ao criar arcos em lote: Conflito de nome ou ordem em um dos registros.',
          );
        }
        throw error;
      }
    });
  }
}
