enum NatsEvents {
    UserCreated = "user:created",
    UserEdited = "user:edited",
    UserImageEdited = "user:image:edited",
    TeamCreated = "team:created",
    TeamInvited = "team:invited",
    TeamInviteCancelled = "team:invite:cancelled",
    TeamAccepted = "team:accepted",
    TeamDeclined = "team:declined",
    TeamRemoved = "team:removed",
}

export default NatsEvents;