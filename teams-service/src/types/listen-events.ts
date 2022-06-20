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

export interface UserImageEditedEvent {
    event: NatsEvents.UserImageEdited;
    data: {
        _id: string;
        profileImageUrl: string;
        _version: number;
    }
}