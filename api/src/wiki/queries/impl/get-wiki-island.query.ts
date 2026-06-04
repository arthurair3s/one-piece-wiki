export class GetWikiIslandQuery {
  constructor(
    public readonly islandId: number,
    public readonly sagaId?: number,
    public readonly arcId?: number,
  ) {}
}
