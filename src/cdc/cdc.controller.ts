import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CdcService } from './cdc.service';

@Controller()
export class CdcController {
  private readonly logger = new Logger(CdcController.name);

  constructor(private readonly cdcService: CdcService) {}

  @MessagePattern('pg.public.events')
  async handleEventChange(@Payload() message: any) {
    const payload = this.extractPayload(message);
    if (payload) await this.cdcService.processEventChange(payload);
  }

  @MessagePattern('pg.public.characters')
  async handleCharacterChange(@Payload() message: any) {
    const payload = this.extractPayload(message);
    if (payload) await this.cdcService.processCharacterChange(payload);
  }

  @MessagePattern('pg.public.character_versions')
  async handleCharacterVersionChange(@Payload() message: any) {
    const payload = this.extractPayload(message);
    if (payload) await this.cdcService.processCharacterVersionChange(payload);
  }

  @MessagePattern('pg.public.event_participants')
  async handleEventParticipantChange(@Payload() message: any) {
    const payload = this.extractPayload(message);
    if (payload) await this.cdcService.processEventParticipantChange(payload);
  }

  @MessagePattern('pg.public.islands')
  async handleIslandChange(@Payload() message: any) {
    const payload = this.extractPayload(message);
    if (payload) await this.cdcService.processIslandChange(payload);
  }

  @MessagePattern('pg.public.arcs')
  async handleArcChange(@Payload() message: any) {
    const payload = this.extractPayload(message);
    if (payload) await this.cdcService.processArcChange(payload);
  }

  @MessagePattern('pg.public.arc_islands')
  async handleArcIslandChange(@Payload() message: any) {
    const payload = this.extractPayload(message);
    if (payload) await this.cdcService.processArcIslandChange(payload);
  }

  @MessagePattern('pg.public.island_character_versions')
  async handleIslandCharacterVersionChange(@Payload() message: any) {
    const payload = this.extractPayload(message);
    if (payload) await this.cdcService.processIslandCharacterVersionChange(payload);
  }

  @MessagePattern('pg.public.sagas')
  async handleSagaChange(@Payload() message: any) {
    const payload = this.extractPayload(message);
    if (payload) await this.cdcService.processSagaChange(payload);
  }

  private extractPayload(message: any) {
    let payload = message;
    if (message && message.payload !== undefined) {
      payload = message.payload;
    }
    if (!payload || !payload.op) {
      this.logger.warn(`Mensagem recebida sem estrutura válida: ${JSON.stringify(message)}`);
      return null;
    }
    this.logger.log(`Recebido CDC: ${payload.source.table} [op=${payload.op}]`);
    return payload;
  }
}
