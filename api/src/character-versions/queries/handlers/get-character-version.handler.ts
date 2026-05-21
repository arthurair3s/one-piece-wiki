import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { GetCharacterVersionQuery } from '../impl/get-character-version.query';
import { CharacterVersion } from '../../models/character-version.model';
import { Character } from '../../../characters/models/character.model';

@QueryHandler(GetCharacterVersionQuery)
export class GetCharacterVersionHandler implements IQueryHandler<GetCharacterVersionQuery> {
  constructor(
    @InjectModel(CharacterVersion)
    private readonly characterVersionModel: typeof CharacterVersion,
  ) {}

  async execute(query: GetCharacterVersionQuery) {
    const version = await this.characterVersionModel.findByPk(query.id, {
        include: [Character]
    });
    if (!version) {
      throw new NotFoundException(`CharacterVersion com ID ${query.id} não encontrada`);
    }
    return version;
  }
}
