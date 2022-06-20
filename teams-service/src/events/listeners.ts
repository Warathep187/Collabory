import { natsClient } from "../services/nats-streaming";
import NatsEvents from "./events";
import { Message } from "node-nats-streaming";
import { UserCreatedEvent, UserEditedEvent, UserImageEditedEvent } from "../types/listen-events";
import User from "../models/user";

const getSubscriptionOption = (qGroup: string) => {
    return natsClient
        .subscriptionOptions()
        .setDeliverAllAvailable()
        .setManualAckMode(true)
        .setAckWait(30 * 1000)
        .setDurableName(qGroup);
};

export const setUserCreatedListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as UserCreatedEvent["data"];

            const isExisting = await User.findById(data._id).select("_id");
            if (isExisting) {
                msg.ack();
                throw new Error("User is existing");
            }

            const newUser = new User({ _id: data._id, name: data.name });
            await newUser.save();

            msg.ack();
        } catch (e) {
            throw new Error("Something went wrong");
        }
    });
};

export const setUserEditedListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as UserEditedEvent["data"];

            const user = await User.findOne({_id: data._id, _version: data._version - 1});
            if(!user) {
                throw new Error("User not found");
            }

            user.name = data.name;
            user._version = user._version + 1;
            await user.save();

            msg.ack();
        } catch (e) {
            throw new Error("Something went wrong");
        }
    });
};

export const setUserImageEditedListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as UserImageEditedEvent["data"];

            const user = await User.findOne({_id: data._id, _version: data._version - 1});
            if(!user) {
                throw new Error("User not found");
            }

            user.profileImageUrl = data.profileImageUrl;
            user._version = user._version + 1;
            await user.save();

            msg.ack();
        } catch(e) {
            throw new Error("Something went wrong");
        }
    })
}