export class UpdateSagaCommand {
  constructor(
    public readonly id: number,
    public readonly name?: string,
    public readonly order?: number,
  ) {}
}