import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { DeleteCharacterVersionCommand } from '../impl/delete-character-version.command';
import { CharacterVersion } from '../../models/character-version.model';
import { ArcCharacterVersion } from '../../../arcs/models/arc-character-version.model';
import { EventParticipant } from '../../../events/models/event-participant.model';

@CommandHandler(DeleteCharacterVersionCommand)
export class DeleteCharacterVersionHandler implements ICommandHandler<DeleteCharacterVersionCommand> {
  constructor(
    @InjectModel(CharacterVersion)
    private readonly characterVersionModel: typeof CharacterVersion,
    @InjectModel(ArcCharacterVersion)
    private readonly arcCharacterVersionModel: typeof ArcCharacterVersion,
    @InjectModel(EventParticipant)
    private readonly eventParticipantModel: typeof EventParticipant,
    private readonly sequelize: Sequelize,
  ) {}

  async execute(command: DeleteCharacterVersionCommand) {
    const version = await this.characterVersionModel.findByPk(command.id);
    if (!version) {
      throw new NotFoundException(`CharacterVersion com ID ${command.id} não encontrada`);
    }
    
    await this.sequelize.transaction(async (t) => {
      // 1. Cascade delete to pivots
      await this.arcCharacterVersionModel.destroy({
        where: { character_version_id: command.id },
        transaction: t,
      });

      await this.eventParticipantModel.destroy({
        where: { character_version_id: command.id },
        transaction: t,
      });

      // 2. Delete the version itself
      await version.destroy({ transaction: t });
    });

    return { success: true, message: `CharacterVersion com ID ${command.id} foi removida com sucesso` };
  }
}
