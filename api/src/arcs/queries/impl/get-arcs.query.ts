export class GetArcsQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly saga_id?: number,
    public readonly name?: string,
  ) {}
}