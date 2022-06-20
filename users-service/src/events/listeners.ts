import { natsClient } from "../services/nats-streaming";
import NatsEvents from "./events";
import { UserCreatedEvent, TeamInvitedEvent, TeamInviteCancelledEvent, TeamRemovedEvent, NotificationReadEvent } from "../types/listen-events";
import { Message } from "node-nats-streaming";
import User from "../models/user";

const getSubscriptionOption = (qGroup: string) => {
    return natsClient
    .subscriptionOptions()
    .setDeliverAllAvailable()
    .setManualAckMode(true)
    .setAckWait(30 * 1000)
    .setDurableName(qGroup);
}

export const setUserCreatedListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as UserCreatedEvent["data"];
    
            const isExisting = await User.findById(data._id).select("_id");
            if(isExisting) {
                return msg.ack();
            }

            const newUser = new User({_id: data._id, email: data.email, name: data.name});
            await newUser.save();
    
            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
};

export const setTeamInvitedListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamInvitedEvent["data"];

            const user = await User.findById(data.userId);
            if(!user) {
                throw new Error("User not found");
            }
            user.unreadNotification = user.unreadNotification + 1;
            await user.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setTeamInviteCancelledListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamInviteCancelledEvent["data"];

            const user = await User.findById(data.userId);
            if(!user) {
                throw new Error("User not found");
            }
            user.unreadNotification = user.unreadNotification - 1 === 0 ? 0: user.unreadNotification - 1;
            await user.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setTeamRemovedListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamRemovedEvent["data"];

            const user = await User.findById(data.userId);
            if(!user) {
                throw new Error("User not found");
            }
            user.unreadNotification = user.unreadNotification + 1;
            await user.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setNotificationReadListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as NotificationReadEvent["data"];

            const user = await User.findById(data._id);
            if(!user) {
                throw new Error("User not found");
            }
            user.unreadNotification = 0;
            await user.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}