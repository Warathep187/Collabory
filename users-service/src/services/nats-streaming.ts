import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import {
    setUserCreatedListener,
    setTeamInvitedListener,
    setTeamInviteCancelledListener,
    setTeamRemovedListener,
    setNotificationReadListener,
} from "../events/listeners";
import NatsEvents from "../events/events";

export const natsClient = nats.connect("test-cluster", randomBytes(4).toString("hex"), {
    url: process.env.NATS_URL,
});

export const connectToNatsStreaming = async () => {
    try {
        natsClient.on("connect", async () => {
            console.log("Nats is connected");
            await setUserCreatedListener(NatsEvents.UserCreated, "users-service");
            await setTeamInvitedListener(NatsEvents.TeamInvited, "users-service");
            await setTeamInviteCancelledListener(NatsEvents.TeamInviteCancelled, "users-service");
            await setTeamRemovedListener(NatsEvents.TeamRemoved, "users-service");
            await setNotificationReadListener(NatsEvents.NotificationRead, "users-service");
        });
    } catch (e) {
        console.log(e);
    }
};
