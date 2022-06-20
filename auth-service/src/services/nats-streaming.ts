import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import NatsEvents from "../events/events";

export const natsClient = nats.connect("test-cluster", randomBytes(4).toString("hex"), {
    url: process.env.NATS_URL
})

export const connectToNatsStreaming = async () => {
    try {
        natsClient.on("connect", async () => {
            console.log("Nats is connected");
        });
    }catch(e) {
        console.log(e);
    }
}