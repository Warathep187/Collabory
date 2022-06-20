import { natsClient } from "../services/nats-streaming";
import NatsEvents from "./events";
import { Message } from "node-nats-streaming";
import {
    TeamAcceptedEvent,
    TeamCreatedEvent,
    TeamDeclinedEvent,
    TeamEditedEvent,
    TeamImageEditedEvent,
    TeamInviteCancelledEvent,
    TeamInvitedEvent,
    TeamRemovedEvent,
    UserCreatedEvent,
    UserEditedEvent,
    UserImageEditedEvent,
} from "../types/listen-events";
import { connection } from "../services/mysql-connecting";
import { RowDataPacket } from "mysql2";
import { NotificationTypes } from "../schemas/notifications";
import { v4 as uuidv4 } from "uuid";

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
            const [rows] = await connection.query<RowDataPacket[]>("SELECT * FROM users WHERE _id=?", [data._id]);
            if (rows.length > 0) {
                return msg.ack();
            }
            console.log(rows);
            await connection.query("INSERT INTO users(_id, name) VALUES (?, ?)", [data._id, data.name]);

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

            const [rows] = await connection.query<RowDataPacket[]>("SELECT * FROM users WHERE _id=? AND _version=?", [
                data._id,
                data._version - 1,
            ]);
            if (rows.length === 0) {
                throw new Error("User not found");
            }

            await connection.query("UPDATE users SET name=?, _version=? WHERE _id=?", [
                data.name,
                data._version,
                data._id,
            ]);

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

            const [rows] = await connection.query<RowDataPacket[]>("SELECT * FROM users WHERE _id=? AND _version=?", [
                data._id,
                data._version - 1,
            ]);
            if (rows.length === 0) {
                throw new Error("User not found");
            }

            await connection.query("UPDATE users SET profile_image_url=?, _version=? WHERE _id=?", [
                data.profileImageUrl,
                data._version,
                data._id,
            ]);

            msg.ack();
        } catch (e) {
            throw new Error("Something went wrong");
        }
    });
};

export const setTeamCreatedListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamCreatedEvent["data"];

            const [rows] = await connection.query<RowDataPacket[]>("SELECT * FROM teams WHERE _id=?", [data._id]);
            if (rows.length > 0) {
                return msg.ack();
            }
            console.log(data);

            await connection.query("INSERT INTO teams(_id, name, image_url) VALUES(?, ?, ?)", [
                data._id,
                data.name,
                data.imageUrl,
            ]);

            msg.ack();
        } catch (e) {
            throw new Error("Something went wrong");
        }
    });
};

export const setTeamEditedListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamEditedEvent["data"];

            const [rows] = await connection.query<RowDataPacket[]>("SELECT * FROM teams WHERE _id=? AND _version=?", [
                data._id,
                data._version - 1,
            ]);
            if (rows.length === 0) {
                throw new Error("Team not found");
            }

            await connection.query("UPDATE teams SET name=?, _version=? WHERE _id=?", [
                data.name,
                data._version,
                data._id,
            ]);

            msg.ack();
        } catch (e) {
            throw new Error("Something went wrong");
        }
    });
};

export const setTeamImageEditedListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamImageEditedEvent["data"];

            const [rows] = await connection.query<RowDataPacket[]>("SELECT * FROM teams WHERE _id=? AND _version=?", [
                data._id,
                data._version - 1,
            ]);
            if (rows.length === 0) {
                throw new Error("Team not found");
            }

            await connection.query("UPDATE teams SET image_url=?, _version=? WHERE _id=?", [
                data.imageUrl,
                data._version,
                data._id,
            ]);

            msg.ack();
        } catch (e) {
            throw new Error("Something went wrong");
        }
    });
};

export const setTeamInvitedListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamInvitedEvent["data"];

            await connection.query(
                "INSERT INTO notifications(_id, to_user, notification_type, team_id) VALUES(?, ?, ?, ?)",
                [uuidv4(), data.userId, NotificationTypes.INVITATION, data.teamId]
            );

            msg.ack();
        } catch (e) {
            console.log(e);
            throw new Error("Something went wrong");
        }
    });
};

export const setTeamInviteCancelledListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamInviteCancelledEvent["data"];

            const [rows] = await connection.query<RowDataPacket[]>(
                "SELECT * FROM notifications WHERE to_user=? AND team_id=? AND notification_type=?",
                [data.userId, data.teamId, NotificationTypes.INVITATION]
            );
            if (rows.length === 0) {
                throw new Error("Not found");
            }

            await connection.query("DELETE FROM notifications WHERE notification_type=? AND to_user=? AND team_id=?", [
                NotificationTypes.INVITATION,
                data.userId,
                data.teamId,
            ]);

            msg.ack();
        } catch (e) {
            console.log(e);
            throw new Error("Something went wrong");
        }
    });
};

export const setTeamAcceptedListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamAcceptedEvent["data"];

            const [rows] = await connection.query<RowDataPacket[]>(
                "SELECT * FROM notifications WHERE to_user=? AND team_id=? AND notification_type=?",
                [data.userId, data.teamId, NotificationTypes.INVITATION]
            );
            if (rows.length === 0) {
                throw new Error("Not found");
            }

            await connection.query("DELETE FROM notifications WHERE notification_type=? AND to_user=? AND team_id=?", [
                NotificationTypes.INVITATION,
                data.userId,
                data.teamId,
            ]);

            msg.ack();
        } catch (e) {
            console.log(e);
            throw new Error("Something went wrong");
        }
    });
};

export const setTeamDeclinedListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamDeclinedEvent["data"];

            const [rows] = await connection.query<RowDataPacket[]>(
                "SELECT * FROM notifications WHERE to_user=? AND team_id=? AND notification_type=?",
                [data.userId, data.teamId, NotificationTypes.INVITATION]
            );
            if (rows.length === 0) {
                throw new Error("Not found");
            }

            await connection.query("DELETE FROM notifications WHERE notification_type=? AND to_user=? AND team_id=?", [
                NotificationTypes.INVITATION,
                data.userId,
                data.teamId,
            ]);

            msg.ack();
        } catch (e) {
            console.log(e);
            throw new Error("Something went wrong");
        }
    });
};

export const setTeamRemovedListener = (event: NatsEvents, qGroup: string) => {
    const listener = natsClient.subscribe(event, qGroup, getSubscriptionOption(qGroup));
    listener.on("message", async (msg: Message) => {
        try {
            const data = JSON.parse(msg.getData().toString()) as TeamRemovedEvent["data"];

            await connection.query("INSERT INTO notifications(_id, to_user, notification_type, team_id) VALUES(?, ?, ?, ?)", [
                uuidv4(),
                data.userId,
                NotificationTypes.REMOVING,
                data.teamId
            ]);

            msg.ack();
        } catch (e) {
            console.log(e);
            throw new Error("Something went wrong");
        }
    });
};