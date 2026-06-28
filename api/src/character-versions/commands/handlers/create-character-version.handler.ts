import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { CreateCharacterVersionCommand } from '../impl/create-character-version.command';
import { CharacterVersion } from '../../models/character-version.model';
import { Character } from '../../../characters/models/character.model';
import { Arc } from '../../../arcs/models/arc.model';
import { ArcCharacterVersion } from '../../../arcs/models/arc-character-version.model';
import { EventParticipant } from '../../../events/models/event-participant.model';

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
    @InjectModel(EventParticipant)
    private readonly eventParticipantModel: typeof EventParticipant,
    private readonly sequelize: Sequelize,
  ) {}

  async execute(command: CreateCharacterVersionCommand) {
    const { character_id, arc_ids, event_ids, ...versionData } = command.data;

    const character = await this.characterModel.findByPk(character_id);
    if (!character) {
      throw new NotFoundException(`Personagem com ID ${character_id} não encontrado`);
    }

    try {
      return await this.sequelize.transaction(async (t) => {
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

        // vincula aos eventos na pivot
        if (event_ids && event_ids.length > 0) {
          const eventPivots = event_ids.map(event_id => ({
            event_id,
            character_version_id: version.id,
            character_id,
          }));
          await this.eventParticipantModel.bulkCreate(eventPivots, { transaction: t });
        }

        return version;
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new BadRequestException('Este personagem já possui outra versão vinculada a um dos arcos ou eventos selecionados.');
      }
      throw error;
    }
  }
}
