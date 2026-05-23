export class CreateEventCommand {
  constructor(
    public readonly arcIslandId: number,
    public readonly title: string,
    public readonly type: string,
    public readonly description: string | undefined,
    public readonly order: number,
  ) {}
}
