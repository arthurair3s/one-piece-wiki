import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CdcService } from './cdc.service';

// Modelos de Escrita (para hooks e leitura)
import { Saga } from '../sagas/models/saga.model';
import { Island } from '../islands/models/island.model';
import { Arc } from '../arcs/models/arc.model';
import { ArcIsland } from '../arcs/models/arc-island.model';
import { Character } from '../characters/models/character.model';
import { CharacterVersion } from '../character-versions/models/character-version.model';
import { ArcCharacterVersion } from '../arcs/models/arc-character-version.model';
import { Event } from '../events/models/event.model';
import { EventParticipant } from '../events/models/event-participant.model';

// Modelos de Leitura (para bulk insert/update e deletion)
import { SagaRead } from '../sagas/models/saga-read.model';
import { ArcRead } from '../arcs/models/arc-read.model';
import { IslandRead } from '../islands/models/island-read.model';
import { ArcIslandRead } from '../arcs/models/arc-island-read.model';
import { CharacterRead } from '../characters/models/character-read.model';
import { CharacterVersionRead } from '../character-versions/models/character-version-read.model';
import { ArcCharacterVersionRead } from '../arcs/models/arc-character-version-read.model';
import { EventRead } from '../events/models/event-read.model';
import { EventParticipantRead } from '../events/models/event-participant-read.model';

@Injectable()
export class CdcBypassService implements OnModuleInit {
  private readonly logger = new Logger(CdcBypassService.name);

  constructor(
    private readonly cdcService: CdcService,
    @InjectModel(SagaRead, 'read-db')
    private readonly sagaReadModel: typeof SagaRead,
    @InjectModel(ArcRead, 'read-db')
    private readonly arcReadModel: typeof ArcRead,
    @InjectModel(IslandRead, 'read-db')
    private readonly islandReadModel: typeof IslandRead,
    @InjectModel(ArcIslandRead, 'read-db')
    private readonly arcIslandReadModel: typeof ArcIslandRead,
    @InjectModel(CharacterRead, 'read-db')
    private readonly characterReadModel: typeof CharacterRead,
    @InjectModel(CharacterVersionRead, 'read-db')
    private readonly characterVersionReadModel: typeof CharacterVersionRead,
    @InjectModel(ArcCharacterVersionRead, 'read-db')
    private readonly arcCharacterVersionReadModel: typeof ArcCharacterVersionRead,
    @InjectModel(EventRead, 'read-db')
    private readonly eventReadModel: typeof EventRead,
    @InjectModel(EventParticipantRead, 'read-db')
    private readonly eventParticipantReadModel: typeof EventParticipantRead,
  ) {}

  async onModuleInit() {
    if (process.env.BYPASS_CDC !== 'true') {
      this.logger.log('Bypass de CDC inativo (modo de produção desativado ou executando localmente com Kafka).');
      return;
    }

    this.logger.log('⚠️ BYPASS_CDC ativo! Registrando hooks do Sequelize para replicação direta...');

    const modelsToBypass = [
      { model: Saga as any, cdcMethod: 'processSagaChange' as const },
      { model: Island as any, cdcMethod: 'processIslandChange' as const },
      { model: Arc as any, cdcMethod: 'processArcChange' as const },
      { model: ArcIsland as any, cdcMethod: 'processArcIslandChange' as const },
      { model: Character as any, cdcMethod: 'processCharacterChange' as const },
      { model: CharacterVersion as any, cdcMethod: 'processCharacterVersionChange' as const },
      { model: ArcCharacterVersion as any, cdcMethod: 'processArcCharacterVersionChange' as const },
      { model: Event as any, cdcMethod: 'processEventChange' as const },
      { model: EventParticipant as any, cdcMethod: 'processEventParticipantChange' as const },
    ];

    for (const entry of modelsToBypass) {
      const model = entry.model;
      const modelName = model.name;

      model.addHook('afterCreate', async (instance: any) => {
        this.logger.log(`[Bypass CDC] afterCreate no modelo ${modelName} (ID: ${instance.id})`);
        try {
          await this.cdcService[entry.cdcMethod]({
            op: 'c',
            before: null,
            after: instance.toJSON(),
            source: { table: model.tableName },
            ts_ms: Date.now(),
            transaction: null,
          });
        } catch (err: any) {
          this.logger.error(`Erro no afterCreate do bypass para ${modelName}: ${err.message}`);
        }
      });

      model.addHook('afterUpdate', async (instance: any) => {
        this.logger.log(`[Bypass CDC] afterUpdate no modelo ${modelName} (ID: ${instance.id})`);
        try {
          await this.cdcService[entry.cdcMethod]({
            op: 'u',
            before: instance._previousDataValues,
            after: instance.toJSON(),
            source: { table: model.tableName },
            ts_ms: Date.now(),
            transaction: null,
          });
        } catch (err: any) {
          this.logger.error(`Erro no afterUpdate do bypass para ${modelName}: ${err.message}`);
        }
      });

      model.addHook('afterDestroy', async (instance: any) => {
        this.logger.log(`[Bypass CDC] afterDestroy no modelo ${modelName} (ID: ${instance.id})`);
        try {
          await this.cdcService[entry.cdcMethod]({
            op: 'd',
            before: instance.toJSON(),
            after: null,
            source: { table: model.tableName },
            ts_ms: Date.now(),
            transaction: null,
          });
        } catch (err: any) {
          this.logger.error(`Erro no afterDestroy do bypass para ${modelName}: ${err.message}`);
        }
      });
    }

    // Registra Hooks de Bulk Destroy específicos para as tabelas de associação/pivô
    ArcIsland.addHook('afterBulkDestroy', async (options: any) => {
      if (options.where) {
        this.logger.log(`[Bypass CDC] afterBulkDestroy em ArcIsland com cláusula where`);
        try {
          await this.arcIslandReadModel.destroy({ where: options.where });
        } catch (err: any) {
          this.logger.error(`Erro no afterBulkDestroy do bypass para ArcIsland: ${err.message}`);
        }
      }
    });

    ArcCharacterVersion.addHook('afterBulkDestroy', async (options: any) => {
      if (options.where) {
        this.logger.log(`[Bypass CDC] afterBulkDestroy em ArcCharacterVersion com cláusula where`);
        try {
          await this.arcCharacterVersionReadModel.destroy({ where: options.where });
        } catch (err: any) {
          this.logger.error(`Erro no afterBulkDestroy do bypass para ArcCharacterVersion: ${err.message}`);
        }
      }
    });

    EventParticipant.addHook('afterBulkDestroy', async (options: any) => {
      if (options.where) {
        this.logger.log(`[Bypass CDC] afterBulkDestroy em EventParticipant com cláusula where`);
        try {
          await this.eventParticipantReadModel.destroy({ where: options.where });
        } catch (err: any) {
          this.logger.error(`Erro no afterBulkDestroy do bypass para EventParticipant: ${err.message}`);
        }
      }
    });

    // Executa a sincronização inicial
    await this.syncAll();
  }

  async syncAll() {
    this.logger.log('Iniciando sincronização programática do Read Model...');
    try {
      // 1. Sagas
      const sagas = await Saga.findAll({ raw: true, paranoid: false });
      if (sagas.length > 0) {
        await this.sagaReadModel.bulkCreate(sagas as any[], {
          updateOnDuplicate: ['name', 'description', 'order', 'createdAt', 'updatedAt', 'deletedAt'],
        });
      }
      this.logger.log(`Sincronizados ${sagas.length} Sagas.`);

      // 2. Arcs
      const arcs = await Arc.findAll({ raw: true, paranoid: false });
      if (arcs.length > 0) {
        await this.arcReadModel.bulkCreate(arcs as any[], {
          updateOnDuplicate: ['name', 'description', 'saga_id', 'order', 'createdAt', 'updatedAt', 'deletedAt'],
        });
      }
      this.logger.log(`Sincronizados ${arcs.length} Arcs.`);

      // 3. Islands
      const islands = await Island.findAll({ raw: true, paranoid: false });
      if (islands.length > 0) {
        await this.islandReadModel.bulkCreate(islands as any[], {
          updateOnDuplicate: [
            'name',
            'description',
            'coordinate_x',
            'coordinate_y',
            'coordinate_z',
            'rotation_y',
            'scale',
            'model_url',
            'thumbnail_url',
            'is_active',
            'createdAt',
            'updatedAt',
            'deletedAt',
          ],
        });
      }
      this.logger.log(`Sincronizados ${islands.length} Islands.`);

      // 4. ArcIslands
      const arcIslands = await ArcIsland.findAll({ raw: true, paranoid: false });
      if (arcIslands.length > 0) {
        await this.arcIslandReadModel.bulkCreate(arcIslands as any[], {
          updateOnDuplicate: ['arc_id', 'island_id', 'order', 'createdAt', 'updatedAt', 'deletedAt'],
        });
      }
      this.logger.log(`Sincronizados ${arcIslands.length} ArcIslands.`);

      // 5. Characters
      const characters = await Character.findAll({ raw: true, paranoid: false });
      if (characters.length > 0) {
        await this.characterReadModel.bulkCreate(characters as any[], {
          updateOnDuplicate: ['name', 'slug', 'createdAt', 'updatedAt', 'deletedAt'],
        });
      }
      this.logger.log(`Sincronizados ${characters.length} Characters.`);

      // 6. CharacterVersions
      const characterVersions = await CharacterVersion.findAll({ raw: true, paranoid: false });
      if (characterVersions.length > 0) {
        await this.characterVersionReadModel.bulkCreate(characterVersions as any[], {
          updateOnDuplicate: [
            'character_id',
            'alias',
            'epithet',
            'bounty',
            'status',
            'image_url',
            'description',
            'createdAt',
            'updatedAt',
            'deletedAt',
          ],
        });
      }
      this.logger.log(`Sincronizados ${characterVersions.length} CharacterVersions.`);

      // 7. ArcCharacterVersions
      const arcCharacterVersions = await ArcCharacterVersion.findAll({ raw: true, paranoid: false });
      if (arcCharacterVersions.length > 0) {
        await this.arcCharacterVersionReadModel.bulkCreate(arcCharacterVersions as any[], {
          updateOnDuplicate: ['arc_id', 'character_version_id', 'character_id', 'order', 'createdAt', 'updatedAt', 'deletedAt'],
        });
      }
      this.logger.log(`Sincronizados ${arcCharacterVersions.length} ArcCharacterVersions.`);

      // 8. Events
      const events = await Event.findAll({ raw: true, paranoid: false });
      if (events.length > 0) {
        await this.eventReadModel.bulkCreate(events as any[], {
          updateOnDuplicate: ['arc_island_id', 'title', 'description', 'type', 'order', 'createdAt', 'updatedAt', 'deletedAt'],
        });
      }
      this.logger.log(`Sincronizados ${events.length} Events.`);

      // 9. EventParticipants
      const eventParticipants = await EventParticipant.findAll({ raw: true, paranoid: false });
      if (eventParticipants.length > 0) {
        await this.eventParticipantReadModel.bulkCreate(eventParticipants as any[], {
          updateOnDuplicate: ['event_id', 'character_version_id', 'createdAt', 'updatedAt', 'deletedAt'],
        });
      }
      this.logger.log(`Sincronizados ${eventParticipants.length} EventParticipants.`);

      this.logger.log('Sincronização programática concluída com sucesso!');
    } catch (err: any) {
      this.logger.error('Erro na sincronização automática do Read Model via Sequelize: ' + err.message, err.stack);
    }
  }
}
