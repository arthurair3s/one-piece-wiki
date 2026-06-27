import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/sequelize'; 
import { IslandRead } from '@/islands/models/island-read.model';
import { GetIslandsMapQuery } from '../impl/get-islands-map.query';


@QueryHandler(GetIslandsMapQuery)
export class GetIslandsMapHandler
  implements IQueryHandler<GetIslandsMapQuery>
{
  constructor(
    @InjectModel(IslandRead, 'read-db')
    private readonly islandModel: typeof IslandRead,
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
        'rotation_y',
        'scale',
      ],
      order: [['name', 'ASC']],
    });

    return islands.map((i) => ({
      id: i.id,
      name: i.name,
      model_url: i.model_url,
      thumbnail_url: i.thumbnail_url,
      rotation_y: i.rotation_y,
      scale: i.scale,
      coordinates: {
        x: i.coordinate_x,
        y: i.coordinate_y,
        z: i.coordinate_z,
      },
    }));
  }
}