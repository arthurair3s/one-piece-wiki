import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GetWikiIslandArcQuery } from '../impl/get-wiki-island-arc.query';
import { ArcIslandRead } from '../../../arcs/models/arc-island-read.model';
import { ArcCharacterVersionRead } from '../../../arcs/models/arc-character-version-read.model';
import { IslandRead } from '../../../islands/models/island-read.model';
import { ArcRead } from '../../../arcs/models/arc-read.model';
import { SagaRead } from '../../../sagas/models/saga-read.model';
import { EventRead } from '../../../events/models/event-read.model';
import { CharacterVersionRead } from '../../../character-versions/models/character-version-read.model';
import { CharacterRead } from '../../../characters/models/character-read.model';

@QueryHandler(GetWikiIslandArcQuery)
export class GetWikiIslandArcHandler implements IQueryHandler<GetWikiIslandArcQuery> {
  constructor(
    @InjectModel(ArcIslandRead, 'read-db')
    private readonly arcIslandReadModel: typeof ArcIslandRead,
    @InjectModel(ArcCharacterVersionRead, 'read-db')
    private readonly arcCharacterVersionReadModel: typeof ArcCharacterVersionRead,
  ) {}

  async execute(query: GetWikiIslandArcQuery) {
    const { islandId, arcId } = query;

    // Query 1: Contexto (arc_island_id resolvido internamente) + Eventos
    const arcIsland = await this.arcIslandReadModel.findOne({
      where: { island_id: islandId, arc_id: arcId },
      include: [
        {
          model: IslandRead,
          attributes: ['id', 'name'],
        },
        {
          model: ArcRead,
          attributes: ['id', 'name'],
          include: [
            {
              model: SagaRead,
              attributes: ['name'],
            },
          ],
        },
        {
          model: EventRead,
          attributes: ['id', 'title', 'description', 'type', 'order'],
        },
      ],
    });

    if (!arcIsland) {
      throw new BadRequestException(
        `O arco ${arcId} não está vinculado à ilha ${islandId}.`,
      );
    }

    // Query 2: Personagens do Arco
    const arcCharacters = await this.arcCharacterVersionReadModel.findAll({
      where: { arc_id: arcId },
      include: [
        {
          model: CharacterVersionRead,
          attributes: ['id', 'alias', 'epithet', 'image_url', 'bounty', 'status'],
          include: [
            {
              model: CharacterRead,
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    // Formatar resposta
    const events = ((arcIsland as any).events || [])
      .sort((a: any, b: any) => a.order - b.order)
      .map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        type: e.type,
        order: e.order,
      }));

    const characters = arcCharacters.map((acv: any) => ({
      id: acv.characterVersion?.id,
      name: acv.characterVersion?.alias || acv.characterVersion?.character?.name,
      epithet: acv.characterVersion?.epithet,
      imageUrl: acv.characterVersion?.image_url,
      bounty: acv.characterVersion?.bounty,
      status: acv.characterVersion?.status,
    }));

    return {
      island: {
        id: (arcIsland as any).island?.id,
        name: (arcIsland as any).island?.name,
      },
      arc: {
        id: (arcIsland as any).arc?.id,
        name: (arcIsland as any).arc?.name,
        sagaName: (arcIsland as any).arc?.saga?.name,
      },
      characters,
      events,
    };
  }
}
