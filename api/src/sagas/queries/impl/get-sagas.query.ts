export class GetSagasQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly name?: string,
    public readonly order?: number,
  ) {}
}