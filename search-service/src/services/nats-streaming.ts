import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import {
    setUserCreatedListener,
    setUserEditedListener,
    setUserImageEditedListener,
    setTeamCreatedListener,
    setTeamInvitedListener,
    setTeamInviteCancelledListener,
    setTeamAcceptedListener,
    setTeamDeclinedListener,
    setTeamRemovedListener,
} from "../events/listeners";

export const natsClient = nats.connect("test-cluster", randomBytes(4).toString("hex"), {
    url: process.env.NATS_URL,
});

export const connectToNatsStreaming = async () => {
    try {
        const qGroupName = "search-service";
        natsClient.on("connect", async () => {
            console.log("Nats is connected");
            await setUserCreatedListener(qGroupName);
            await setUserEditedListener(qGroupName);
            await setUserImageEditedListener(qGroupName);
            await setTeamCreatedListener(qGroupName);
            await setTeamInvitedListener(qGroupName);
            await setTeamInviteCancelledListener(qGroupName);
            await setTeamAcceptedListener(qGroupName);
            await setTeamDeclinedListener(qGroupName);
            await setTeamRemovedListener(qGroupName);
        });
    } catch (e) {
        console.log(e);
        throw new Error("Error to Nats");
    }
};
