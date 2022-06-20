import { Router, Request, Response } from "express";
import authorizedMiddleware from "../services/authorizedMiddleware";
import { connection } from "../services/mysql-connecting";
import { RowDataPacket } from "mysql2";
import Publisher from "../events/base-publisher";
import {NotificationReadEvent} from "../types/publish-events";
import NatsEvents from "../events/events";

const router = Router();

router.get("/", authorizedMiddleware, async (req: Request, res: Response) => {
    try {
        const { userId } = req.user;

        const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT notifications._id as _id, teams._id as team_id, teams.name as team_name, teams.image_url, notification_type, 
            post_id, replied_from, to_user, created_at
            FROM notifications
            LEFT JOIN teams
            ON notifications.team_id = teams._id
            LEFT JOIN users
            ON notifications.replied_from = users._id
            WHERE to_user="${userId}"
            ORDER BY created_at DESC`,
            [userId]
        );

        res.send({
            notifications: rows.map(notification => ({
                _id: notification._id,
                team: {
                    _id: notification.team_id,
                    name: notification.team_name,
                    image_url: notification.image_url
                },
                notificationType: notification.notification_type,
                postId: notification.post_id,
                repliedFrom: notification.replied_from,
                toUser: notification.to_user,
                createdAt: notification.created_at
            })),
        });

        const publisher = new Publisher<NotificationReadEvent>(NatsEvents.NotificationRead);
        await publisher.publish({
            _id: userId
        })
    } catch (e) {
        res.status(500).send({
            errors: [{ message: "Something went wrong" }],
        });
    }
});

export default router;
