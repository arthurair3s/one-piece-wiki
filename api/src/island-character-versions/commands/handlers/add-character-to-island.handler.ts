import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { AddCharacterToIslandCommand } from '../impl/add-character-to-island.command';
import { IslandCharacterVersion } from '../../models/island-character-version.model';
import { CharacterVersion } from '../../../character-versions/models/character-version.model';
import { Island } from '../../../islands/models/island.model';
import { Arc } from '../../../arcs/models/arc.model';

@CommandHandler(AddCharacterToIslandCommand)
export class AddCharacterToIslandHandler implements ICommandHandler<AddCharacterToIslandCommand> {
  constructor(
    @InjectModel(IslandCharacterVersion)
    private readonly pivotModel: typeof IslandCharacterVersion,
    @InjectModel(CharacterVersion)
    private readonly versionModel: typeof CharacterVersion,
    @InjectModel(Island)
    private readonly islandModel: typeof Island,
  ) {}

  async execute(command: AddCharacterToIslandCommand) {
    const { character_version_id, island_id, order } = command.data;

    const version: any = await this.versionModel.findByPk(character_version_id, {
      include: [{ model: Arc, attributes: ['id', 'order'] }],
    });
    if (!version) {
      throw new NotFoundException(`Versão de personagem com ID ${character_version_id} não encontrada.`);
    }

    const island: any = await this.islandModel.findByPk(island_id, {
      include: [{ model: Arc, attributes: ['id', 'order'] }],
    });
    if (!island) {
      throw new NotFoundException(`Ilha com ID ${island_id} não encontrada.`);
    }

    // regra fundamental: a versão e a ilha devem compartilhar pelo menos um arco em comum
    const versionArcIds = (version.arcs || []).map((a: any) => Number(a.id));
    const islandArcIds = (island.arcs || []).map((a: any) => Number(a.id));
    const commonArcIds = versionArcIds.filter((id: number) => islandArcIds.includes(id));

    if (commonArcIds.length === 0) {
      throw new ConflictException(
        `Esta versão do personagem (Arcos: ${JSON.stringify(versionArcIds)}) não pertence aos arcos desta ilha (Arcos: ${JSON.stringify(islandArcIds)}).`,
      );
    }

    // RN05: ao vincular personagem à ilha, é necessário indicar em qual arco de contexto isso ocorre
    // Se apenas 1 arco em comum, usar esse. Se múltiplos, usar o primeiro (menor ID)
    const arc_id = Math.min(...commonArcIds);

    try {
      return await this.pivotModel.create({ character_version_id, island_id, arc_id, order });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Esta versão do personagem já está vinculada a esta ilha neste arco e ordem.');
      }
      throw error;
    }
  }
}
