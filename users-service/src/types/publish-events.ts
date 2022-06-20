import NatsEvents from "../events/events";

export interface EditProfileEvent {
    event: NatsEvents.UserEdited;
    data: {
        _id: string;
        name: string;
        _version: number;
    }
}

export interface EditProfileImageEvent {
    event: NatsEvents.UserImageEdited;
    data: {
        _id: string;
        profileImageUrl: string
        _version: number;
    }
}