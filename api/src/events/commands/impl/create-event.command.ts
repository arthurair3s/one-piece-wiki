export class CreateEventCommand {
  constructor(
    public readonly island_id: number,
    public readonly title: string,
    public readonly type: string,
    public readonly description?: string,
    public readonly order?: number,
  ) {}
}
