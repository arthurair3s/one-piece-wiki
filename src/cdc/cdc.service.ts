import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EventRead } from '../events/models/event-read.model';
import { CharacterRead } from '../characters/models/character-read.model';
import { CharacterVersionRead } from '../character-versions/models/character-version-read.model';
import { EventParticipantRead } from '../events/models/event-participant-read.model';
import { IslandRead } from '../islands/models/island-read.model';
import { ArcRead } from '../arcs/models/arc-read.model';
import { ArcIslandRead } from '../arcs/models/arc-island-read.model';
import { IslandCharacterVersionRead } from '../island-character-versions/models/island-character-version-read.model';

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
    @InjectModel(IslandCharacterVersionRead, 'read-db')
    private readonly islandCharacterVersionReadModel: typeof IslandCharacterVersionRead,
  ) {}

  async processEventChange(payload: DebeziumPayload<any>) {
    this.logger.log(`Processando CDC Event com op: ${payload.op}`);

    try {
      if (payload.op === 'c' || payload.op === 'r') {
        // Create ou Snapshot inicial (Read)
        const data = payload.after;
        if (!data) return;

        // Utilizamos o id exato gerado no Write DB. O "upsert" garante que mensagens duplicadas no Kafka não criem registros a mais (idempotência básica).
        await this.eventReadModel.upsert({
          id: data.id,
          island_id: data.island_id,
          arc_id: data.arc_id,
          title: data.title,
          description: data.description,
          type: data.type,
          order: data.order,
          // Debezium pode enviar em formatos epoch micro/milli. O Sequelize geralmente consegue realizar parse se cair bem com Date() ou podemos simplificar apenas setando o ts.
          // Para simplificar, o sequelize atualizará o createdAt via schema se não enviarmos, ou usaremos a do payload caso convertida:
          // createdAt: new Date(data.createdAt),
          // updatedAt: new Date(data.updatedAt)
        });
        
        this.logger.log(`[CDC] EventRead criado/upserted para ID: ${data.id}`);

      } else if (payload.op === 'u') {
        // Update (ou Soft Delete)
        const data = payload.after;
        const beforeData = payload.before;
        if (!data) return;

        // Como usamos "paranoid: true", um DELETE na API gera um UPDATE no banco preenchendo o "deletedAt".
        // O Debezium captura isso como uma operação de Update ('u').
        if (data.deletedAt && (!beforeData || !beforeData.deletedAt)) {
          // Se agora tem deletedAt, disparamos o soft delete no Read Model
          await this.eventReadModel.destroy({ where: { id: data.id } });
          this.logger.log(`[CDC] EventRead marcado como deletado (Soft Delete) para ID: ${data.id}`);
        } else {
          // Se for um Restore (tinha deletedAt e agora não tem mais)
          if (beforeData && beforeData.deletedAt && !data.deletedAt) {
            await this.eventReadModel.restore({ where: { id: data.id } });
            this.logger.log(`[CDC] EventRead restaurado (Restore) para ID: ${data.id}`);
          }

          // Atualização normal dos campos
          await this.eventReadModel.update({
            island_id: data.island_id,
            arc_id: data.arc_id,
            title: data.title,
            description: data.description,
            type: data.type,
            order: data.order,
          }, { where: { id: data.id } });
          
          this.logger.log(`[CDC] EventRead atualizado para ID: ${data.id}`);
        }

      } else if (payload.op === 'd') {
        // Delete
        const data = payload.before;
        if (!data) return;

        await this.eventReadModel.destroy({ where: { id: data.id } });
        
        this.logger.log(`[CDC] EventRead deletado (soft/hard dependendo da config) para ID: ${data.id}`);
      }
    } catch (error: any) {
      this.logger.error(`Erro ao processar payload do CDC Events: ${error.message}`, error.stack);
    }
  }

  async processCharacterChange(payload: DebeziumPayload<any>) {
    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;
        await this.characterReadModel.upsert(data);
      } else if (payload.op === 'u') {
        const data = payload.after;
        if (!data) return;
        if (data.deletedAt && (!payload.before || !payload.before.deletedAt)) {
          await this.characterReadModel.destroy({ where: { id: data.id } });
        } else {
          if (payload.before && payload.before.deletedAt && !data.deletedAt) {
            await this.characterReadModel.restore({ where: { id: data.id } });
          }
          await this.characterReadModel.update(data, { where: { id: data.id } });
        }
      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;
        await this.characterReadModel.destroy({ where: { id: data.id } });
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC Character: ${error.message}`);
    }
  }

  async processCharacterVersionChange(payload: DebeziumPayload<any>) {
    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;
        await this.characterVersionReadModel.upsert(data);
      } else if (payload.op === 'u') {
        const data = payload.after;
        if (!data) return;
        if (data.deletedAt && (!payload.before || !payload.before.deletedAt)) {
          await this.characterVersionReadModel.destroy({ where: { id: data.id } });
        } else {
          if (payload.before && payload.before.deletedAt && !data.deletedAt) {
            await this.characterVersionReadModel.restore({ where: { id: data.id } });
          }
          await this.characterVersionReadModel.update(data, { where: { id: data.id } });
        }
      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;
        await this.characterVersionReadModel.destroy({ where: { id: data.id } });
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC CharacterVersion: ${error.message}`);
    }
  }

  async processEventParticipantChange(payload: DebeziumPayload<any>) {
    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;
        await this.eventParticipantReadModel.upsert(data);
      } else if (payload.op === 'u') {
        const data = payload.after;
        if (!data) return;
        if (data.deletedAt && (!payload.before || !payload.before.deletedAt)) {
          await this.eventParticipantReadModel.destroy({ where: { id: data.id } });
        } else {
          if (payload.before && payload.before.deletedAt && !data.deletedAt) {
            await this.eventParticipantReadModel.restore({ where: { id: data.id } });
          }
          await this.eventParticipantReadModel.update(data, { where: { id: data.id } });
        }
      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;
        await this.eventParticipantReadModel.destroy({ where: { id: data.id } });
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC EventParticipant: ${error.message}`);
    }
  }

  async processIslandChange(payload: DebeziumPayload<any>) {
    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;
        await this.islandReadModel.upsert(data);
      } else if (payload.op === 'u') {
        const data = payload.after;
        if (!data) return;
        if (data.deletedAt && (!payload.before || !payload.before.deletedAt)) {
          await this.islandReadModel.destroy({ where: { id: data.id } });
        } else {
          if (payload.before && payload.before.deletedAt && !data.deletedAt) {
            await this.islandReadModel.restore({ where: { id: data.id } });
          }
          await this.islandReadModel.update(data, { where: { id: data.id } });
        }
      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;
        await this.islandReadModel.destroy({ where: { id: data.id } });
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC Island: ${error.message}`);
    }
  }

  async processArcChange(payload: DebeziumPayload<any>) {
    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;
        await this.arcReadModel.upsert(data);
      } else if (payload.op === 'u') {
        const data = payload.after;
        if (!data) return;
        if (data.deletedAt && (!payload.before || !payload.before.deletedAt)) {
          await this.arcReadModel.destroy({ where: { id: data.id } });
        } else {
          if (payload.before && payload.before.deletedAt && !data.deletedAt) {
            await this.arcReadModel.restore({ where: { id: data.id } });
          }
          await this.arcReadModel.update(data, { where: { id: data.id } });
        }
      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;
        await this.arcReadModel.destroy({ where: { id: data.id } });
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC Arc: ${error.message}`);
    }
  }

  async processArcIslandChange(payload: DebeziumPayload<any>) {
    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;
        await this.arcIslandReadModel.upsert(data);
      } else if (payload.op === 'u') {
        const data = payload.after;
        if (!data) return;
        if (data.deletedAt && (!payload.before || !payload.before.deletedAt)) {
          await this.arcIslandReadModel.destroy({ where: { id: data.id } });
        } else {
          if (payload.before && payload.before.deletedAt && !data.deletedAt) {
            await this.arcIslandReadModel.restore({ where: { id: data.id } });
          }
          await this.arcIslandReadModel.update(data, { where: { id: data.id } });
        }
      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;
        await this.arcIslandReadModel.destroy({ where: { id: data.id } });
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC ArcIsland: ${error.message}`);
    }
  }

  async processIslandCharacterVersionChange(payload: DebeziumPayload<any>) {
    try {
      if (payload.op === 'c' || payload.op === 'r') {
        const data = payload.after;
        if (!data) return;
        await this.islandCharacterVersionReadModel.upsert(data);
      } else if (payload.op === 'u') {
        const data = payload.after;
        if (!data) return;
        if (data.deletedAt && (!payload.before || !payload.before.deletedAt)) {
          await this.islandCharacterVersionReadModel.destroy({ where: { id: data.id } });
        } else {
          if (payload.before && payload.before.deletedAt && !data.deletedAt) {
            await this.islandCharacterVersionReadModel.restore({ where: { id: data.id } });
          }
          await this.islandCharacterVersionReadModel.update(data, { where: { id: data.id } });
        }
      } else if (payload.op === 'd') {
        const data = payload.before;
        if (!data) return;
        await this.islandCharacterVersionReadModel.destroy({ where: { id: data.id } });
      }
    } catch (error: any) {
      this.logger.error(`Erro no CDC IslandCharacterVersion: ${error.message}`);
    }
  }
}
