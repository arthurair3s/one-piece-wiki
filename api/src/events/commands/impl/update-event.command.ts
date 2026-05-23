export class UpdateEventCommand {
  constructor(
    public readonly id: number,
    public readonly arcIslandId?: number,
    public readonly title?: string,
    public readonly type?: string,
    public readonly description?: string,
    public readonly order?: number,
  ) {}
}
