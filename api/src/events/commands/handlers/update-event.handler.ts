import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateEventCommand } from '../impl/update-event.command';
import { Event } from '../../models/event.model';
import { Island } from '../../../islands/models/island.model';
import { Arc } from '../../../arcs/models/arc.model';

@CommandHandler(UpdateEventCommand)
export class UpdateEventHandler implements ICommandHandler<UpdateEventCommand> {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(Island)
    private readonly islandModel: typeof Island,
  ) {}

  async execute(command: UpdateEventCommand): Promise<Event> {
    const { id, island_id, arc_id: providedArcId, ...data } = command;

    const event = await this.eventModel.findByPk(id);
    if (!event) {
      throw new NotFoundException(`Event com ID ${id} não encontrado.`);
    }

    let updateData: any = { ...data };
    const targetIslandId = island_id || event.island_id;

    // se island_id ou arc_id estão sendo alterados, precisamos validar
    if (island_id || providedArcId) {
      const island: any = await this.islandModel.findByPk(targetIslandId, {
        include: [{ model: Arc, attributes: ['id', 'order'], through: { attributes: [] } }],
      });
      
      if (!island) {
        throw new NotFoundException(`Island com ID ${targetIslandId} não encontrada.`);
      }

      const arcIds = (island.arcs || []).map((a: any) => Number(a.id));
      if (arcIds.length === 0) {
        throw new ConflictException(
          `Não há arcos associados à ilha ${targetIslandId}. Um evento deve ocorrer em um contexto de arco.`,
        );
      }

      // validar e definir arc_id
      if (providedArcId) {
        // se arc_id foi passado, validar que pertence à ilha
        if (!arcIds.includes(providedArcId)) {
          throw new ConflictException(
            `O arco com ID ${providedArcId} não está associado à ilha ${targetIslandId}. Arcos disponíveis: [${arcIds.join(', ')}].`,
          );
        }
        updateData.arc_id = providedArcId;
      } else if (island_id && island_id !== event.island_id) {
        // se apenas island_id mudou, verificar se o arc_id atual (ou outro válido) existe
        if (!arcIds.includes(event.arc_id)) {
          throw new ConflictException(
            `A nova ilha não contém o arco atual do evento (ID ${event.arc_id}). Um novo arc_id válido deve ser fornecido. Arcos disponíveis: [${arcIds.join(', ')}].`,
          );
        }
      }

      if (island_id) {
        updateData.island_id = island_id;
      }
    }

    return event.update(updateData);
  }
}
