import { natsClient } from "../services/nats-streaming";
import NatsEvents from "./events";

interface Event {
    event: NatsEvents;
    data: any;
}

export class Publisher<T extends Event> {
    private event: T["event"];

    constructor(event: T["event"]) {
        this.event = event;
    }

    publish(data: T["data"]): Promise<void> {
        return new Promise(async(resolve, reject) => {
            try {
                await natsClient.publish(this.event, JSON.stringify(data));
                resolve();
            }catch(e) {
                reject(e);
            }
        })
    }
}