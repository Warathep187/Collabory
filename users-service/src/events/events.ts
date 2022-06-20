enum NatsEvents {
    UserCreated = "user:created",
    UserEdited = "user:edited",
    UserImageEdited = "user:image:edited",
    TeamInvited = "team:invited",
    TeamInviteCancelled = "team:invite:cancelled",
    TeamRemoved = "team:removed",
    NotificationRead = "notification:read"
}

export default NatsEvents;