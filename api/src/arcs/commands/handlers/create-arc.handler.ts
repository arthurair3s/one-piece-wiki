import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { CreateArcCommand } from '../impl/create-arc.command';
import { Arc } from '../../models/arc.model';
import { Saga } from '../../../sagas/models/saga.model';
import { ArcIsland } from '../../models/arc-island.model';
import { ArcCharacterVersion } from '../../models/arc-character-version.model';
import { CharacterVersion } from '../../../character-versions/models/character-version.model';

@CommandHandler(CreateArcCommand)
export class CreateArcHandler implements ICommandHandler<CreateArcCommand> {
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

  async execute(command: CreateArcCommand): Promise<Arc> {
    const { name, description, saga_id, order, islands, character_versions } = command;

    // validação da existência da saga
    const saga = await this.sagaModel.findByPk(saga_id);
    if (!saga) {
      throw new NotFoundException(`Saga com ID ${saga_id} não encontrada.`);
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
        const arc = await this.arcModel.create({
          name,
          description,
          saga_id,
          order,
        }, { transaction: t });

        // Vincula as ilhas
        if (islands && islands.length > 0) {
          const islandPivots = islands.map(i => ({
            arc_id: arc.id,
            island_id: i.island_id,
            order: i.order,
          }));
          await this.arcIslandModel.bulkCreate(islandPivots, { transaction: t });
        }

        // Vincula as versões de personagens
        if (character_versions && character_versions.length > 0) {
          const dbVersions = await this.characterVersionModel.findAll({
            where: { id: character_versions.map(cv => cv.character_version_id) },
            transaction: t
          });
          console.log('API CreateArcHandler: character_versions in payload:', character_versions);
          console.log('API CreateArcHandler: dbVersions found:', dbVersions.map(v => ({ id: v.id, character_id: v.character_id })));

          const charPivots = character_versions.map(cv => {
            const dbVer = dbVersions.find(v => v.id === cv.character_version_id);
            if (!dbVer) {
              throw new NotFoundException(`Versão de personagem com ID ${cv.character_version_id} não encontrada.`);
            }
            return {
              arc_id: arc.id,
              character_version_id: cv.character_version_id,
              character_id: dbVer.character_id,
              order: cv.order,
            };
          });
          await this.arcCharacterVersionModel.bulkCreate(charPivots, { transaction: t });
        }

        return arc;
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException(
          `Já existe um arco com o nome "${name}" ou ordem "${order}" nesta saga, ou há conflito nas restrições de integridade.`,
        );
      }
      throw error;
    }
  }
}