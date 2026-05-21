import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { UpdateCharacterVersionCommand } from '../impl/update-character-version.command';
import { CharacterVersion } from '../../models/character-version.model';
import { Character } from '../../../characters/models/character.model';
import { ArcCharacterVersion } from '../../../arcs/models/arc-character-version.model';

@CommandHandler(UpdateCharacterVersionCommand)
export class UpdateCharacterVersionHandler implements ICommandHandler<UpdateCharacterVersionCommand> {
  constructor(
    @InjectModel(CharacterVersion)
    private readonly characterVersionModel: typeof CharacterVersion,
    @InjectModel(Character)
    private readonly characterModel: typeof Character,
    @InjectModel(ArcCharacterVersion)
    private readonly pivotModel: typeof ArcCharacterVersion,
    private readonly sequelize: Sequelize,
  ) {}

  async execute(command: UpdateCharacterVersionCommand) {
    const { id, data } = command;
    const { character_id, arc_ids, ...updateData } = data;

    const version = await this.characterVersionModel.findByPk(id);
    if (!version) {
      throw new NotFoundException(`Versão de personagem com ID ${id} não encontrada`);
    }

    if (character_id) {
      const character = await this.characterModel.findByPk(character_id);
      if (!character) {
        throw new NotFoundException(`Personagem com ID ${character_id} não encontrado`);
      }
    }

    return this.sequelize.transaction(async (t) => {
      await version.update({ character_id, ...updateData }, { transaction: t });

      if (arc_ids !== undefined) {
        // remove vínculos antigos
        await this.pivotModel.destroy({ 
          where: { character_version_id: id },
          transaction: t 
        });

        if (arc_ids.length > 0) {
          const pivots = arc_ids.map(arc_id => ({
            arc_id,
            character_version_id: id,
            character_id: character_id ?? version.character_id,
            order: 0
          }));
          await this.pivotModel.bulkCreate(pivots, { transaction: t });
        }
      }

      return version;
    });
  }
}
