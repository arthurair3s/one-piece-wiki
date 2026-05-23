import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EventRead } from '../events/models/event-read.model';
import { CharacterRead } from '../characters/models/character-read.model';
import { CharacterVersionRead } from '../character-versions/models/character-version-read.model';
import { EventParticipantRead } from '../events/models/event-participant-read.model';
import { IslandRead } from '../islands/models/island-read.model';
import { ArcRead } from '../arcs/models/arc-read.model';
import { ArcIslandRead } from '../arcs/models/arc-island-read.model';
import { SagaRead } from '../sagas/models/saga-read.model';
import { ArcCharacterVersionRead } from '../arcs/models/arc-character-version-read.model';

export interface DebeziumPayload<T> {
  before: T | null;
  after: T | null;
  source: any;
  op: 'c' | 'u' | 'd' | 'r';
  ts_ms: number;
  transaction: any;
}

@Injectable()
export class CdcService {
  private readonly logger = new Logger(CdcService.name);

  constructor(
    @InjectModel(EventRead, 'read-db')
    private readonly eventReadModel: typeof EventRead,
    @InjectModel(CharacterRead, 'read-db')
    private readonly characterReadModel: typeof CharacterRead,
    @InjectModel(CharacterVersionRead, 'read-db')
    private readonly characterVersionReadModel: typeof CharacterVersionRead,
    @InjectModel(EventParticipantRead, 'read-db')
    private readonly eventParticipantReadModel: typeof EventParticipantRead,
    @InjectModel(IslandRead, 'read-db')
    private readonly islandReadModel: typeof IslandRead,
    @InjectModel(ArcRead, 'read-db')
    private readonly arcReadModel: typeof ArcRead,
    @InjectModel(ArcIslandRead, 'read-db')
    private readonly arcIslandReadModel: typeof ArcIslandRead,
    @InjectModel(SagaRead, 'read-db')
    private readonly sagaReadModel: typeof SagaRead,
    @InjectModel(ArcCharacterVersionRead, 'read-db')
    private readonly arcCharacterVersionReadModel: typeof ArcCharacterVersionRead,
  ) { }

  async processEventChange(payload: DebeziumPayload<any>) {
    this.logger.log(`Processando CDC Event com op: ${payload.op}`);

    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;

        await this.eventReadModel.upsert({
          id: data.id,
          arc_island_id: data.arc_island_id,
          title: data.title,
          description: data.description,
          type: data.type,
          order: data.order,
        });

        this.logger.log(`[CDC] EventRead criado/upserted para ID: ${data.id}`);

      } else if (payload.op === 'u') {
        const data = payload.after;
        const beforeData = payload.before;
        if (!data) return;

        if (data.deletedAt && (!beforeData || !beforeData.deletedAt)) {
          await this.eventReadModel.destroy({ where: { id: data.id } });
          this.logger.log(`[CDC] EventRead marcado como deletado (Soft Delete) para ID: ${data.id}`);
        } else {
          if (beforeData && beforeData.deletedAt && !data.deletedAt) {
            await this.eventReadModel.restore({ where: { id: data.id } });
            this.logger.log(`[CDC] EventRead restaurado para ID: ${data.id}`);
          }

          await this.eventReadModel.update({
            arc_island_id: data.arc_island_id,
            title: data.title,
            description: data.description,
            type: data.type,
            order: data.order,
          }, { where: { id: data.id } });

          this.logger.log(`[CDC] EventRead atualizado para ID: ${data.id}`);
        }

      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;

        await this.eventReadModel.destroy({ where: { id: data.id } });
        this.logger.log(`[CDC] EventRead deletado para ID: ${data.id}`);
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC Event: ${error.message}`, error.stack);
    }
  }

  async processCharacterChange(payload: DebeziumPayload<any>) {
    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;
        await this.characterReadModel.upsert(data);
        this.logger.log(`[CDC] CharacterRead criado/upserted para ID: ${data.id}`);
      } else if (payload.op === 'u') {
        const data = payload.after;
        if (!data) return;
        if (data.deletedAt && (!payload.before || !payload.before.deletedAt)) {
          await this.characterReadModel.destroy({ where: { id: data.id } });
          this.logger.log(`[CDC] CharacterRead marcado como deletado (Soft Delete) para ID: ${data.id}`);
        } else {
          if (payload.before && payload.before.deletedAt && !data.deletedAt) {
            await this.characterReadModel.restore({ where: { id: data.id } });
            this.logger.log(`[CDC] CharacterRead restaurado para ID: ${data.id}`);
          }
          await this.characterReadModel.update(data, { where: { id: data.id } });
          this.logger.log(`[CDC] CharacterRead atualizado para ID: ${data.id}`);
        }
      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;
        await this.characterReadModel.destroy({ where: { id: data.id } });
        this.logger.log(`[CDC] CharacterRead deletado para ID: ${data.id}`);
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC Character: ${error.message}`, error.stack);
    }
  }

  async processCharacterVersionChange(payload: DebeziumPayload<any>) {
    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;
        await this.characterVersionReadModel.upsert(data);
        this.logger.log(`[CDC] CharacterVersionRead criado/upserted para ID: ${data.id}`);
      } else if (payload.op === 'u') {
        const data = payload.after;
        if (!data) return;
        if (data.deletedAt && (!payload.before || !payload.before.deletedAt)) {
          await this.characterVersionReadModel.destroy({ where: { id: data.id } });
          this.logger.log(`[CDC] CharacterVersionRead marcado como deletado (Soft Delete) para ID: ${data.id}`);
        } else {
          if (payload.before && payload.before.deletedAt && !data.deletedAt) {
            await this.characterVersionReadModel.restore({ where: { id: data.id } });
            this.logger.log(`[CDC] CharacterVersionRead restaurado para ID: ${data.id}`);
          }
          await this.characterVersionReadModel.update(data, { where: { id: data.id } });
          this.logger.log(`[CDC] CharacterVersionRead atualizado para ID: ${data.id}`);
        }
      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;
        await this.characterVersionReadModel.destroy({ where: { id: data.id } });
        this.logger.log(`[CDC] CharacterVersionRead deletado para ID: ${data.id}`);
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC CharacterVersion: ${error.message}`, error.stack);
    }
  }

  async processEventParticipantChange(payload: DebeziumPayload<any>) {
    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;
        await this.eventParticipantReadModel.upsert(data);
        this.logger.log(`[CDC] EventParticipantRead criado/upserted para ID: ${data.id}`);
      } else if (payload.op === 'u') {
        const data = payload.after;
        if (!data) return;
        if (data.deletedAt && (!payload.before || !payload.before.deletedAt)) {
          await this.eventParticipantReadModel.destroy({ where: { id: data.id } });
          this.logger.log(`[CDC] EventParticipantRead marcado como deletado (Soft Delete) para ID: ${data.id}`);
        } else {
          if (payload.before && payload.before.deletedAt && !data.deletedAt) {
            await this.eventParticipantReadModel.restore({ where: { id: data.id } });
            this.logger.log(`[CDC] EventParticipantRead restaurado para ID: ${data.id}`);
          }
          await this.eventParticipantReadModel.update(data, { where: { id: data.id } });
          this.logger.log(`[CDC] EventParticipantRead atualizado para ID: ${data.id}`);
        }
      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;
        await this.eventParticipantReadModel.destroy({ where: { id: data.id } });
        this.logger.log(`[CDC] EventParticipantRead deletado para ID: ${data.id}`);
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC EventParticipant: ${error.message}`, error.stack);
    }
  }

  async processIslandChange(payload: DebeziumPayload<any>) {
    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;
        await this.islandReadModel.upsert(data);
        this.logger.log(`[CDC] IslandRead criado/upserted para ID: ${data.id}`);
      } else if (payload.op === 'u') {
        const data = payload.after;
        if (!data) return;
        if (data.deletedAt && (!payload.before || !payload.before.deletedAt)) {
          await this.islandReadModel.destroy({ where: { id: data.id } });
          this.logger.log(`[CDC] IslandRead marcado como deletado (Soft Delete) para ID: ${data.id}`);
        } else {
          if (payload.before && payload.before.deletedAt && !data.deletedAt) {
            await this.islandReadModel.restore({ where: { id: data.id } });
            this.logger.log(`[CDC] IslandRead restaurado para ID: ${data.id}`);
          }
          await this.islandReadModel.update(data, { where: { id: data.id } });
          this.logger.log(`[CDC] IslandRead atualizado para ID: ${data.id}`);
        }
      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;
        await this.islandReadModel.destroy({ where: { id: data.id } });
        this.logger.log(`[CDC] IslandRead deletado para ID: ${data.id}`);
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC Island: ${error.message}`, error.stack);
    }
  }

  async processArcChange(payload: DebeziumPayload<any>) {
    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;
        await this.arcReadModel.upsert(data);
        this.logger.log(`[CDC] ArcRead criado/upserted para ID: ${data.id}`);
      } else if (payload.op === 'u') {
        const data = payload.after;
        if (!data) return;
        if (data.deletedAt && (!payload.before || !payload.before.deletedAt)) {
          await this.arcReadModel.destroy({ where: { id: data.id } });
          this.logger.log(`[CDC] ArcRead marcado como deletado (Soft Delete) para ID: ${data.id}`);
        } else {
          if (payload.before && payload.before.deletedAt && !data.deletedAt) {
            await this.arcReadModel.restore({ where: { id: data.id } });
            this.logger.log(`[CDC] ArcRead restaurado para ID: ${data.id}`);
          }
          await this.arcReadModel.update(data, { where: { id: data.id } });
          this.logger.log(`[CDC] ArcRead atualizado para ID: ${data.id}`);
        }
      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;
        await this.arcReadModel.destroy({ where: { id: data.id } });
        this.logger.log(`[CDC] ArcRead deletado para ID: ${data.id}`);
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC Arc: ${error.message}`, error.stack);
    }
  }

  async processArcIslandChange(payload: DebeziumPayload<any>) {
    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;
        await this.arcIslandReadModel.upsert(data);
        this.logger.log(`[CDC] ArcIslandRead criado/upserted para ID: ${data.id}`);
      } else if (payload.op === 'u') {
        const data = payload.after;
        if (!data) return;
        if (data.deletedAt && (!payload.before || !payload.before.deletedAt)) {
          await this.arcIslandReadModel.destroy({ where: { id: data.id } });
          this.logger.log(`[CDC] ArcIslandRead marcado como deletado (Soft Delete) para ID: ${data.id}`);
        } else {
          if (payload.before && payload.before.deletedAt && !data.deletedAt) {
            await this.arcIslandReadModel.restore({ where: { id: data.id } });
            this.logger.log(`[CDC] ArcIslandRead restaurado para ID: ${data.id}`);
          }
          await this.arcIslandReadModel.update(data, { where: { id: data.id } });
          this.logger.log(`[CDC] ArcIslandRead atualizado para ID: ${data.id}`);
        }
      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;
        await this.arcIslandReadModel.destroy({ where: { id: data.id } });
        this.logger.log(`[CDC] ArcIslandRead deletado para ID: ${data.id}`);
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC ArcIsland: ${error.message}`, error.stack);
    }
  }

  async processSagaChange(payload: DebeziumPayload<any>) {
    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;
        await this.sagaReadModel.upsert(data);
        this.logger.log(`[CDC] SagaRead criado/upserted para ID: ${data.id}`);
      } else if (payload.op === 'u') {
        const data = payload.after;
        if (!data) return;
        if (data.deletedAt && (!payload.before || !payload.before.deletedAt)) {
          await this.sagaReadModel.destroy({ where: { id: data.id } });
          this.logger.log(`[CDC] SagaRead marcado como deletado (Soft Delete) para ID: ${data.id}`);
        } else {
          if (payload.before && payload.before.deletedAt && !data.deletedAt) {
            await this.sagaReadModel.restore({ where: { id: data.id } });
            this.logger.log(`[CDC] SagaRead restaurado para ID: ${data.id}`);
          }
          await this.sagaReadModel.update(data, { where: { id: data.id } });
          this.logger.log(`[CDC] SagaRead atualizado para ID: ${data.id}`);
        }
      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;
        await this.sagaReadModel.destroy({ where: { id: data.id } });
        this.logger.log(`[CDC] SagaRead deletado para ID: ${data.id}`);
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC Saga: ${error.message}`, error.stack);
    }
  }

  async processArcCharacterVersionChange(payload: DebeziumPayload<any>) {
    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;
        await this.arcCharacterVersionReadModel.upsert(data);
        this.logger.log(`[CDC] ArcCharacterVersionRead criado/upserted para ID: ${data.id}`);
      } else if (payload.op === 'u') {
        const data = payload.after;
        if (!data) return;
        if (data.deletedAt && (!payload.before || !payload.before.deletedAt)) {
          await this.arcCharacterVersionReadModel.destroy({ where: { id: data.id } });
          this.logger.log(`[CDC] ArcCharacterVersionRead marcado como deletado (Soft Delete) para ID: ${data.id}`);
        } else {
          if (payload.before && payload.before.deletedAt && !data.deletedAt) {
            await this.arcCharacterVersionReadModel.restore({ where: { id: data.id } });
            this.logger.log(`[CDC] ArcCharacterVersionRead restaurado para ID: ${data.id}`);
          }
          await this.arcCharacterVersionReadModel.update(data, { where: { id: data.id } });
          this.logger.log(`[CDC] ArcCharacterVersionRead atualizado para ID: ${data.id}`);
        }
      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;
        await this.arcCharacterVersionReadModel.destroy({ where: { id: data.id } });
        this.logger.log(`[CDC] ArcCharacterVersionRead deletado para ID: ${data.id}`);
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC ArcCharacterVersion: ${error.message}`, error.stack);
    }
  }
}
