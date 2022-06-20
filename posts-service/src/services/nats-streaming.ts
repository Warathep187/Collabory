import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { setUserCreatedListener, setUserEditedListener, setUserImageEditedListener, setTeamCreatedListener, setTeamAcceptedListener, setTeamRemovedListener } from "../events/listeners";

export const natsClient = nats.connect("test-cluster", randomBytes(4).toString("hex"), {
    url: process.env.NATS_URL,
});

export const connectToNatsStreaming = async () => {
    try {
        const qGroupName = "posts-service";
        natsClient.on("connect", async () => {
            console.log("Nats is connected");
            await setUserCreatedListener(qGroupName);
            await setUserEditedListener(qGroupName);
            await setUserImageEditedListener(qGroupName);
            await setTeamCreatedListener(qGroupName);
            await setTeamAcceptedListener(qGroupName);
            await setTeamRemovedListener(qGroupName);
        });
    } catch (e) {
        console.log(e);
        throw new Error("Error to Nats");
    }
};
