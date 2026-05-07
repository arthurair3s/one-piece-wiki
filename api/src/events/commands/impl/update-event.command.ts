export class UpdateEventCommand {
  constructor(
    public readonly id: number,
    public readonly island_id?: number,
    public readonly title?: string,
    public readonly type?: string,
    public readonly description?: string,
    public readonly arc_id?: number,
    public readonly order?: number,
  ) {}
}
