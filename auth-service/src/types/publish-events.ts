import NatsEvents from "../events/events";

export interface UserCreatedEvent {
    event: NatsEvents.UserCreated;
    data: {
        _id: string;
        name: string;
        email: string;
    }
}