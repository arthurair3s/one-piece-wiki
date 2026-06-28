import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { UpdateCharacterVersionCommand } from '../impl/update-character-version.command';
import { CharacterVersion } from '../../models/character-version.model';
import { Character } from '../../../characters/models/character.model';
import { ArcCharacterVersion } from '../../../arcs/models/arc-character-version.model';
import { EventParticipant } from '../../../events/models/event-participant.model';

@CommandHandler(UpdateCharacterVersionCommand)
export class UpdateCharacterVersionHandler implements ICommandHandler<UpdateCharacterVersionCommand> {
  constructor(
    @InjectModel(CharacterVersion)
    private readonly characterVersionModel: typeof CharacterVersion,
    @InjectModel(Character)
    private readonly characterModel: typeof Character,
    @InjectModel(ArcCharacterVersion)
    private readonly pivotModel: typeof ArcCharacterVersion,
    @InjectModel(EventParticipant)
    private readonly eventParticipantModel: typeof EventParticipant,
    private readonly sequelize: Sequelize,
  ) {}

  async execute(command: UpdateCharacterVersionCommand) {
    const { id, data } = command;
    const { character_id, arc_ids, event_ids, ...updateData } = data;

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

      if (event_ids !== undefined) {
        // Fetch existing events
        const existingEventPivots = await this.eventParticipantModel.findAll({
          where: { character_version_id: id },
          transaction: t
        });
        const existingEventIds = existingEventPivots.map(p => p.event_id);

        // Calculate differences
        const toAddEvents = event_ids.filter(id => !existingEventIds.includes(id));
        const toRemoveEvents = existingEventIds.filter(id => !event_ids.includes(id));

        if (toRemoveEvents.length > 0) {
          await this.eventParticipantModel.destroy({ 
            where: { 
              character_version_id: id,
              event_id: toRemoveEvents
            },
            transaction: t 
          });
        }

        if (toAddEvents.length > 0) {
          const eventPivots = toAddEvents.map(event_id => ({
            event_id,
            character_version_id: id,
            character_id: character_id ?? version.character_id,
          }));
          await this.eventParticipantModel.bulkCreate(eventPivots, { transaction: t });
        }
      }

      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new BadRequestException('Este personagem já possui outra versão vinculada a um dos arcos ou eventos selecionados.');
      }
      throw error;
    }
  }
}
