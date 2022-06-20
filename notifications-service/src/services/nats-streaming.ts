import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import NatsEvents from "../events/events";
import {setTeamAcceptedListener, setTeamCreatedListener, setTeamDeclinedListener, setTeamEditedListener, setTeamImageEditedListener, setTeamInviteCancelledListener, setTeamInvitedListener, setTeamRemovedListener, setUserCreatedListener, setUserEditedListener, setUserImageEditedListener} from "../events/listeners";

export const natsClient = nats.connect("test-cluster", randomBytes(4).toString("hex"), {
    url: process.env.NATS_URL!
})

export const connectToNatsStreaming = () => {
    try {
        natsClient.on("connect", async () => {
            console.log("Nats is connected");
            await setUserCreatedListener(NatsEvents.UserCreated, "notifications-service");
            await setUserEditedListener(NatsEvents.UserEdited, "notifications-service");
            await setUserImageEditedListener(NatsEvents.UserImageEdited, "notifications-service");
            await setTeamCreatedListener(NatsEvents.TeamCreated, "notifications-service");
            await setTeamEditedListener(NatsEvents.TeamEdited, "notifications-service");
            await setTeamImageEditedListener(NatsEvents.TeamImageEdited, "notifications-service");
            await setTeamInvitedListener(NatsEvents.TeamInvited, "notifications-service");
            await setTeamInviteCancelledListener(NatsEvents.TeamInviteCancelled, "notifications-service");
            await setTeamAcceptedListener(NatsEvents.TeamAccepted, "notifications-service");
            await setTeamDeclinedListener(NatsEvents.TeamDeclined, "notifications-service");
            await setTeamRemovedListener(NatsEvents.TeamRemoved, "notifications-service");
        });
    }catch(e) {
        console.log(e);
    }
}