import NatsEvents from "./events";
import { natsClient } from "../services/nats-streaming";
import { Message } from "node-nats-streaming";
import { TeamAcceptedEvent, TeamCreatedEvent, UserCreatedEvent, UserEditedEvent, TeamRemovedEvent, UserImageEditedEvent } from "../types/listen-events";
import User from "../models/user";

const getSubscriptionOption = (qGroup: string) => {
    return natsClient
        .subscriptionOptions()
        .setDeliverAllAvailable()
        .setManualAckMode(true)
        .setAckWait(30 * 1000)
        .setDurableName(qGroup);
};

export const setUserCreatedListener = (qGroup: string) => {
    const listener = natsClient.subscribe(NatsEvents.UserCreated, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as UserCreatedEvent["data"];

            const isExisting = await User.findById(data._id);
            if(isExisting) {
                return msg.ack();
            }
            const newUser = new User({_id: data._id, name: data.name, teams: []});
            await newUser.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setUserEditedListener = (qGroup: string) => {
    const listener = natsClient.subscribe(NatsEvents.UserEdited, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as UserEditedEvent["data"];

            const user = await User.findOne({_id: data._id, _version: data._version - 1});
            if(!user) {
                throw new Error("User not found");
            }
            console.log(data);
            user.name = data.name;
            user._version = data._version;
            await user.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setUserImageEditedListener = (qGroup: string) => {
    const listener = natsClient.subscribe(NatsEvents.UserEdited, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as UserImageEditedEvent["data"];

            const user = await User.findOne({_id: data._id, _version: data._version - 1});
            if(!user) {
                throw new Error("User not found");
            }
            user.profileImageUrl = data.profileImageUrl;
            user._version = data._version;
            await user.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setTeamCreatedListener = (qGroup: string) => {
    const listener = natsClient.subscribe(NatsEvents.TeamCreated, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamCreatedEvent["data"];

            const user = await User.findById(data.hostId);
            if(!user) {
                throw new Error("User not found");
            }
            if(user.teams.includes(data._id)) {
                return msg.ack();
            }
            user.teams.push(data._id);
            await user.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setTeamAcceptedListener = (qGroup: string) => {
    const listener = natsClient.subscribe(NatsEvents.TeamAccepted, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamAcceptedEvent["data"];

            const user = await User.findById(data.userId);
            if(!user) {
                throw new Error("User not found");
            }
            if(user.teams.includes(data.teamId)) {
                throw new Error("User is in this team")
            }
            user.teams.push(data.teamId);
            await user.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}

export const setTeamRemovedListener = (qGroup: string) => {
    const listener = natsClient.subscribe(NatsEvents.TeamRemoved, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamRemovedEvent["data"];

            const user = await User.findById(data.userId);
            if(!user) {
                throw new Error("User not found");
            }
            if(!user.teams.includes(data.teamId)) {
                throw new Error("User is not in this team");
            }
            user.teams = user.teams.filter(team => team !== data.teamId);
            await user.save();

            msg.ack();
        }catch(e) {
            throw new Error("Something went wrong");
        }
    })
}