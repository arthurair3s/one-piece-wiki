export class GetIslandDetailsQuery {
  constructor(
    public readonly islandId: number,
    public readonly arcId: number,
  ) {}
}