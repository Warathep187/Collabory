export enum NotificationTypes {
    INVITATION = "invitation",
    REMOVING = "removing",
    REPLY = "reply"
}

export interface NotificationSchema {
    _id: string;
    to_user: string;
    notification_type: NotificationTypes;
    team_id: string;
    post_id?: string;
    replied_from?: string;
    created_at: Date;
}

export const NOTIFICATION_SCHEMA = `
    notifications (
        _id VARCHAR(100) NOT NULL PRIMARY KEY,
        to_user VARCHAR(100) NOT NULL,
        notification_type VARCHAR(100) NOT NULL,
        team_id VARCHAR(100) NOT NULL,
        post_id VARCHAR(100),
        replied_from VARCHAR(100),
        created_at DATETIME DEFAULT NOW(),
        FOREIGN KEY(team_id) REFERENCES teams(_id),
        FOREIGN KEY(replied_from) REFERENCES users(_id)
    )
`