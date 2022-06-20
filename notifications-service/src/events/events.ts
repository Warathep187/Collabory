enum NatsEvents {
    UserCreated = "user:created",
    UserEdited = "user:edited",
    UserImageEdited = "user:image:edited",
    TeamCreated = "team:created",
    TeamEdited = "team:edited",
    TeamImageEdited = "team:image:edited",
    TeamInvited = "team:invited",
    TeamInviteCancelled = "team:invite:cancelled",
    TeamAccepted = "team:accepted",
    TeamDeclined = "team:declined",
    TeamRemoved = "team:removed",
    NotificationRead = "notification:read"
}

export default NatsEvents;