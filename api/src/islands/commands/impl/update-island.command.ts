export class UpdateIslandCommand {
  constructor(
    public readonly id: number,
    public readonly name?: string,
    public readonly description?: string,
    public readonly arc_ids?: number[],
    public readonly coordinate_x?: number,
    public readonly coordinate_y?: number,
    public readonly coordinate_z?: number,
    public readonly model_url?: string,
    public readonly thumbnail_url?: string,
    public readonly is_active?: boolean,
  ) {}
}