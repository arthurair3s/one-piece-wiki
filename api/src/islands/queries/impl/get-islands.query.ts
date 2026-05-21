export class GetIslandsQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly arc_id?: number,
    public readonly is_active?: boolean,
  ) {}
}