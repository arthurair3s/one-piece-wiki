export class CreateArcCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly saga_id: number,
    public readonly order: number,
    public readonly islands?: { island_id: number; order: number }[],
    public readonly character_versions?: { character_version_id: number; order: number }[],
  ) {}
}