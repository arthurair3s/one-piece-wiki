export class GetWikiMapFilteredQuery {
  constructor(
    public readonly sagaId?: number,
    public readonly arcId?: number,
    public readonly search?: string,
  ) {}
}
