import NatsEvents from "../events/events";

export interface UserCreatedEvent {
    event: NatsEvents.UserCreated,
    data: {
        _id: string;
        name: string;
        email: string;
    }
}

export interface TeamInvitedEvent {
    event: NatsEvents.TeamInvited;
    data: {
        teamId: string;
        userId: string;
    }
}

export interface TeamInviteCancelledEvent {
    event: NatsEvents.TeamInviteCancelled;
    data: {
        teamId: string;
        userId: string;
    }
}

export interface TeamRemovedEvent {
    event: NatsEvents.TeamRemoved;
    data: {
        teamId: string;
        userId: string;
    }
}

export interface NotificationReadEvent {
    event: NatsEvents.NotificationRead;
    data: {
        _id: string;
    }
}