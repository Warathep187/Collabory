import NatsEvents from "../events/events";

export interface TeamCreatedEvent {
    event: NatsEvents.TeamCreated;
    data: {
        _id: string;
        name: string;
        imageUrl: string;
        hostId: string;
    };
}

export interface TeamEditedEvent {
    event: NatsEvents.TeamEdited;
    data: {
        _id: string;
        name: string;
        _version: number;
    };
}

export interface TeamImageEditedEvent {
    event : NatsEvents.TeamImageEdited;
    data: {
        _id: string;
        imageUrl: string;
        _version: number;
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

export interface TeamAcceptedEvent {
    event: NatsEvents.TeamAccepted,
    data: {
        teamId: string;
        userId: string;
    }
}

export interface TeamDeclinedEvent {
    event: NatsEvents.TeamDeclined,
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