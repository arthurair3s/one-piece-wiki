export class GetEventsQuery {
  constructor(
    public readonly page?: number,
    public readonly limit?: number,
    public readonly island_id?: number,
    public readonly type?: string,
  ) {}
}
