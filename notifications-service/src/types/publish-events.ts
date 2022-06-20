import NatsEvents from "../events/events";

export interface NotificationReadEvent {
    event: NatsEvents.NotificationRead;
    data: {
        _id: string;
    }
}