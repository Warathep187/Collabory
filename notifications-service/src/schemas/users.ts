export interface UserSchema {
    _id: string;
    name: string;
    profileImageUrl: string;
    _version: number;
}

export const USER_SCHEMA = `
    users (
        _id VARCHAR(100) NOT NULL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        profile_image_url VARCHAR(255) DEFAULT "https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg",
        _version INT DEFAULT 0
    )
`