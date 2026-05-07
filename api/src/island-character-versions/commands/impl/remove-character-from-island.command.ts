export class RemoveCharacterFromIslandCommand {
  constructor(
    public readonly island_id: number,
    public readonly character_version_id: number
  ) {}
}
