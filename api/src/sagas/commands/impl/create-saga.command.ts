export class CreateSagaCommand {
  constructor(
    public readonly name: string,
    public readonly order: number,
    public readonly description?: string,
  ) {}
}