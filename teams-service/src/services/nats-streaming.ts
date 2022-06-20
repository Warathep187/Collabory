import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import NatsEvents from "../events/events";
import {setUserCreatedListener, setUserEditedListener, setUserImageEditedListener} from "../events/listeners";

export const natsClient = nats.connect("test-cluster", randomBytes(4).toString("hex"), {
    url: process.env.NATS_URL!
})

export const connectToNatsStreaming = () => {
    try {
        natsClient.on("connect", async () => {
            console.log("Nats is connected");
            await setUserCreatedListener(NatsEvents.UserCreated, "teams-service");
            await setUserEditedListener(NatsEvents.UserEdited, "teams-service");
            await setUserImageEditedListener(NatsEvents.UserImageEdited, "team-service");
        });
    }catch(e) {
        console.log(e);
    }
}