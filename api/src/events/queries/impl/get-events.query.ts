export class GetEventsQuery {
  constructor(
    public readonly page?: number,
    public readonly limit?: number,
    public readonly arcIslandId?: number,
    public readonly type?: string,
  ) {}
}
