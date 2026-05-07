import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { CreateEventCommand } from '../impl/create-event.command';
import { Event } from '../../models/event.model';
import { Island } from '../../../islands/models/island.model';
import { Arc } from '../../../arcs/models/arc.model';
import { ConflictException, NotFoundException } from '@nestjs/common';

@CommandHandler(CreateEventCommand)
export class CreateEventHandler implements ICommandHandler<CreateEventCommand> {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(Island)
    private readonly islandModel: typeof Island,
  ) {}

  async execute(command: CreateEventCommand): Promise<Event> {
    const { island_id, title, type, description, arc_id: providedArcId, order } = command;
    
    // ilha deve existir e trazer seus arcos associados
    const island: any = await this.islandModel.findByPk(island_id, {
      include: [{ model: Arc, attributes: ['id', 'order'], through: { attributes: [] } }],
    });
    
    if (!island) {
      throw new NotFoundException(`Island com ID ${island_id} não encontrada.`);
    }

    // determina automaticamente o arc_id baseado nos arcos da ilha
    const arcIds = (island.arcs || []).map((a: any) => Number(a.id));
    if (arcIds.length === 0) {
      throw new ConflictException(
        `Não há arcos associados à ilha ${island_id}. Um evento deve ocorrer em um contexto de arco.`,
      );
    }

    // arc_id é obrigatório
    if (!providedArcId) {
      throw new ConflictException(
        `O arc_id é obrigatório. Nenhum arco foi fornecido para o evento na ilha ${island_id}.`,
      );
    }

    // validar que pertence à ilha
    if (!arcIds.includes(providedArcId)) {
      throw new ConflictException(
        `O arco com ID ${providedArcId} não está associado à ilha ${island_id}. Arcos disponíveis: [${arcIds.join(', ')}].`,
      );
    }
    
    const arc_id = providedArcId;

    // impede duplicidade de ordem na mesma ilha
    const existing = await this.eventModel.findOne({
      where: { island_id, order },
    });

    if (existing) {
      throw new ConflictException(
        `Já existe um evento com a ordem ${order} nesta ilha.`,
      );
    }

    return this.eventModel.create({
      island_id,
      arc_id,
      title,
      type,
      description,
      order,
    });
  }
}
