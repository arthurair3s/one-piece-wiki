export class UpdateArcCommand {
  constructor(
    public readonly id: number,
    public readonly name?: string,
    public readonly description?: string,
    public readonly saga_id?: number,
    public readonly order?: number,
  ) {}
}