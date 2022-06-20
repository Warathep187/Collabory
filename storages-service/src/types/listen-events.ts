import NatsEvents from "../events/events";

export interface UserCreatedEvent {
    event: NatsEvents.UserCreated;
    data: {
        _id: string;
        name: string;
    }
}

export interface UserEditedEvent {
    event: NatsEvents.UserEdited;
    data: {
        _id: string;
        name: string;
        _version: number;
    }
}

export interface TeamCreatedEvent {
    event: NatsEvents.TeamCreated;
    data: {
        _id: string;
        hostId: string;
    };
}

export interface TeamAcceptedEvent {
    event: NatsEvents.TeamAccepted,
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