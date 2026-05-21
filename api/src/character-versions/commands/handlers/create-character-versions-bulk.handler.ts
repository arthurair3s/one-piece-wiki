import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { CreateCharacterVersionsBulkCommand } from '../impl/create-character-versions-bulk.command';
import { CharacterVersion } from '../../models/character-version.model';
import { Character } from '../../../characters/models/character.model';
import { Arc } from '../../../arcs/models/arc.model';
import { ArcCharacterVersion } from '../../../arcs/models/arc-character-version.model';

@CommandHandler(CreateCharacterVersionsBulkCommand)
export class CreateCharacterVersionsBulkHandler implements ICommandHandler<CreateCharacterVersionsBulkCommand> {
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

  async execute(command: CreateCharacterVersionsBulkCommand) {
    const versionsDto = command.data;

    // 1. Validar Characters
    const characterIds = [...new Set(versionsDto.map(v => v.character_id))];
    const foundCharacters = await this.characterModel.findAll({
      where: { id: { [Op.in]: characterIds } }
    });
    if (foundCharacters.length !== characterIds.length) {
      throw new NotFoundException(`Um ou mais Characters informados não existem.`);
    }

    // 2. Validar Arcos
    const allArcIds = [...new Set(versionsDto.flatMap(v => v.arc_ids || []))];
    if (allArcIds.length > 0) {
      const foundArcs = await this.arcModel.findAll({
        where: { id: { [Op.in]: allArcIds } }
      });
      if (foundArcs.length !== allArcIds.length) {
        throw new NotFoundException(`Um ou mais Arcos informados não existem.`);
      }
    }

    // 3. Execução Transacional
    return this.sequelize.transaction(async (t) => {
      const createdVersions: CharacterVersion[] = [];

      for (const dto of versionsDto) {
        const version = await this.characterVersionModel.create({
          character_id: dto.character_id,
          alias: dto.alias,
          epithet: dto.epithet,
          bounty: dto.bounty,
          status: dto.status,
          image_url: dto.image_url,
          description: dto.description,
        } as any, { transaction: t });

        if (dto.arc_ids && dto.arc_ids.length > 0) {
          const pivots = dto.arc_ids.map(arc_id => ({
            arc_id,
            character_version_id: version.id,
            character_id: dto.character_id,
            order: 0 // RN04: ordem de aparição do personagem no arco
          }));
          await this.pivotModel.bulkCreate(pivots, { transaction: t });
        }
        createdVersions.push(version);
      }

      return createdVersions;
    });
  }
}
