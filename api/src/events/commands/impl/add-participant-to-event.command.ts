export class AddParticipantToEventCommand {
  constructor(
    public readonly event_id: number,
    public readonly character_version_id: number,
  ) {}
}
