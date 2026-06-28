import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { UpdateArcCommand } from '../impl/update-arc.command';
import { Arc } from 'src/arcs/models/arc.model';
import { Saga } from 'src/sagas/models/saga.model';
import { ArcIsland } from '../../models/arc-island.model';
import { ArcCharacterVersion } from '../../models/arc-character-version.model';
import { CharacterVersion } from '../../../character-versions/models/character-version.model';

@CommandHandler(UpdateArcCommand)
export class UpdateArcHandler implements ICommandHandler<UpdateArcCommand> {
  constructor(
    @InjectModel(Arc)
    private readonly arcModel: typeof Arc,

    @InjectModel(Saga)
    private readonly sagaModel: typeof Saga,

    @InjectModel(ArcIsland)
    private readonly arcIslandModel: typeof ArcIsland,

    @InjectModel(ArcCharacterVersion)
    private readonly arcCharacterVersionModel: typeof ArcCharacterVersion,

    @InjectModel(CharacterVersion)
    private readonly characterVersionModel: typeof CharacterVersion,

    private readonly sequelize: Sequelize,
  ) {}

  async execute(command: UpdateArcCommand): Promise<Arc> {
    const { id, name, description, saga_id, order, islands, character_versions } = command;

    // REGRA 1 — Arc deve existir
    const arc = await this.arcModel.findByPk(id);
    if (!arc) {
      throw new NotFoundException('Arc não encontrado');
    }

    // REGRA 2 — Se for mudar saga, validar se ela existe
    let targetSagaId = arc.saga_id;

    if (saga_id !== undefined && saga_id !== arc.saga_id) {
      const saga = await this.sagaModel.findByPk(saga_id);
      if (!saga) {
        throw new NotFoundException('Saga não encontrada');
      }

      targetSagaId = saga_id;
    }

    // REGRA 3 — validar order dentro da saga alvo
    if (order !== undefined) {
      const existingOrder = await this.arcModel.findOne({
        where: {
          saga_id: targetSagaId,
          order,
        },
      });

      if (existingOrder && existingOrder.id !== id) {
        throw new BadRequestException(
          'Já existe um arco com essa ordem nessa saga',
        );
      }
    }

    // REGRA 4 — validar nome único dentro da saga
    if (name !== undefined) {
      const existingName = await this.arcModel.findOne({
        where: {
          saga_id: targetSagaId,
          name,
        },
      });

      if (existingName && existingName.id !== id) {
        throw new BadRequestException(
          'Já existe um arco com esse nome nessa saga',
        );
      }
    }

    // Validar duplicidade de islands no payload
    if (islands && islands.length > 0) {
      const islandIds = islands.map(i => i.island_id);
      if (new Set(islandIds).size !== islandIds.length) {
        throw new BadRequestException('A mesma ilha não pode ser selecionada mais de uma vez para o mesmo arco.');
      }
    }

    // Validar duplicidade de personagens por versões de personagens no payload
    if (character_versions && character_versions.length > 0) {
      const charVersionIds = character_versions.map(cv => cv.character_version_id);
      const dbVersions = await this.characterVersionModel.findAll({
        where: { id: charVersionIds }
      });
      
      const characterIds = dbVersions.map(v => v.character_id);
      if (new Set(characterIds).size !== characterIds.length) {
        throw new BadRequestException('Um arco não pode conter mais de uma versão do mesmo personagem.');
      }
    }

    try {
      return await this.sequelize.transaction(async (t) => {
        // atualização do arco
        await arc.update({
          name: name ?? arc.name,
          description: description ?? arc.description,
          saga_id: targetSagaId,
          order: order ?? arc.order,
        }, { transaction: t });

        // Diffing de ilhas
        if (islands !== undefined) {
          const existingIslands = await this.arcIslandModel.findAll({
            where: { arc_id: id },
            transaction: t
          });

          // 1. Deletar os que não estão mais no payload
          const newIslandIds = islands.map(i => i.island_id);
          const toDelete = existingIslands.filter(ei => !newIslandIds.includes(ei.island_id));
          if (toDelete.length > 0) {
            await this.arcIslandModel.destroy({
              where: { id: toDelete.map(d => d.id) },
              transaction: t
            });
          }

          // 2. Inserir novos ou atualizar os existentes
          for (const item of islands) {
            const existing = existingIslands.find(ei => ei.island_id === item.island_id);
            if (existing) {
              if (existing.order !== item.order) {
                await existing.update({ order: item.order }, { transaction: t });
              }
            } else {
              await this.arcIslandModel.create({
                arc_id: id,
                island_id: item.island_id,
                order: item.order
              }, { transaction: t });
            }
          }
        }

        // Diffing de versões de personagens
        if (character_versions !== undefined) {
          const existingVersions = await this.arcCharacterVersionModel.findAll({
            where: { arc_id: id },
            transaction: t
          });

          // 1. Deletar os que não estão mais no payload
          const newVersionIds = character_versions.map(cv => cv.character_version_id);
          const toDelete = existingVersions.filter(ev => !newVersionIds.includes(ev.character_version_id));
          if (toDelete.length > 0) {
            await this.arcCharacterVersionModel.destroy({
              where: {
                arc_id: id,
                character_version_id: toDelete.map(d => d.character_version_id)
              },
              transaction: t
            });
          }

          // 2. Inserir novos ou atualizar os existentes
          const dbVersions = await this.characterVersionModel.findAll({
            where: { id: newVersionIds },
            transaction: t
          });

          for (const item of character_versions) {
            const existing = existingVersions.find(ev => ev.character_version_id === item.character_version_id);
            if (existing) {
              if (existing.order !== item.order) {
                await existing.update({ order: item.order }, { transaction: t });
              }
            } else {
              const dbVer = dbVersions.find(v => v.id === item.character_version_id);
              if (!dbVer) {
                throw new NotFoundException(`Versão de personagem com ID ${item.character_version_id} não encontrada.`);
              }
              await this.arcCharacterVersionModel.create({
                arc_id: id,
                character_version_id: item.character_version_id,
                character_id: dbVer.character_id,
                order: item.order
              }, { transaction: t });
            }
          }
        }

        return arc;
      });
    } catch (error) {
      throw error;
    }
  }
}