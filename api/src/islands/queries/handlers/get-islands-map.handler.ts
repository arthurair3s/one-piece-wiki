import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize'; 
import { Island } from '@/islands/models/island.model';
import { GetIslandsMapQuery } from '../impl/get-islands-map.query';


@QueryHandler(GetIslandsMapQuery)
export class GetIslandsMapHandler
  implements IQueryHandler<GetIslandsMapQuery>
{
  constructor(
    @InjectModel(Island)
    private readonly islandModel: typeof Island,
  ) {}

  async execute() {
    const islands = await this.islandModel.findAll({
      where: { is_active: true },
      attributes: [
        'id',
        'name',
        'coordinate_x',
        'coordinate_y',
        'coordinate_z',
        'model_url',
        'thumbnail_url',
      ],
      order: [['name', 'ASC']],
    });

    return islands.map((i) => ({
      id: i.id,
      name: i.name,
      model_url: i.model_url,
      thumbnail_url: i.thumbnail_url,
      coordinates: {
        x: i.coordinate_x,
        y: i.coordinate_y,
        z: i.coordinate_z,
      },
    }));
  }
}