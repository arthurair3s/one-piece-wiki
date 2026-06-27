import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException, BadRequestException } from '@nestjs/common';
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

    try {
      return await this.sequelize.transaction(async (t) => {
        await version.update({ character_id, ...updateData }, { transaction: t });

      if (arc_ids !== undefined) {
        // Fetch existing arcs
        const existingPivots = await this.pivotModel.findAll({
          where: { character_version_id: id },
          transaction: t
        });
        const existingArcIds = existingPivots.map(p => p.arc_id);

        // Calculate differences
        const toAdd = arc_ids.filter(id => !existingArcIds.includes(id));
        const toRemove = existingArcIds.filter(id => !arc_ids.includes(id));

        if (toRemove.length > 0) {
          await this.pivotModel.destroy({ 
            where: { 
              character_version_id: id,
              arc_id: toRemove
            },
            transaction: t 
          });
        }

        if (toAdd.length > 0) {
          const pivots = toAdd.map(arc_id => ({
            arc_id,
            character_version_id: id,
            character_id: character_id ?? version.character_id,
            order: 0
          }));
          await this.pivotModel.bulkCreate(pivots, { transaction: t });
        }
      }

      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new BadRequestException('Este personagem já possui outra versão vinculada a um dos arcos selecionados. Um personagem não pode aparecer duas vezes no mesmo arco.');
      }
      throw error;
    }
  }
}
