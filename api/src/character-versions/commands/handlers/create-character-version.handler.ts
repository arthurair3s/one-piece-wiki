import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { CreateCharacterVersionCommand } from '../impl/create-character-version.command';
import { CharacterVersion } from '../../models/character-version.model';
import { Character } from '../../../characters/models/character.model';
import { Arc } from '../../../arcs/models/arc.model';
import { ArcCharacterVersion } from '../../../arcs/models/arc-character-version.model';

@CommandHandler(CreateCharacterVersionCommand)
export class CreateCharacterVersionHandler implements ICommandHandler<CreateCharacterVersionCommand> {
  constructor(
    @InjectModel(CharacterVersion)
    private readonly characterVersionModel: typeof CharacterVersion,
    @InjectModel(Character)
    private readonly characterModel: typeof Character,
    @InjectModel(Arc)
    private readonly arcModel: typeof Arc,
    @InjectModel(ArcCharacterVersion)
    private readonly pivotModel: typeof ArcCharacterVersion,
    private readonly sequelize: Sequelize,
  ) {}

  async execute(command: CreateCharacterVersionCommand) {
    const { character_id, arc_ids, ...versionData } = command.data;

    const character = await this.characterModel.findByPk(character_id);
    if (!character) {
      throw new NotFoundException(`Personagem com ID ${character_id} não encontrado`);
    }

    return this.sequelize.transaction(async (t) => {
      // cria a versão
      const version = await this.characterVersionModel.create({
        character_id,
        ...versionData,
      } as any, { transaction: t });

      // vincula aos arcos na pivot de forma manual e segura
      if (arc_ids && arc_ids.length > 0) {
        const pivots = arc_ids.map(arc_id => ({
          arc_id,
          character_version_id: version.id,
          character_id,
          order: 0,
        }));
        await this.pivotModel.bulkCreate(pivots, { transaction: t });
      }

      return version;
    });
  }
}
