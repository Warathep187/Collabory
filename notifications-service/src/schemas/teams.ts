export interface TeamSchema {
    _id: string;
    name: string;
    image_url: string;
    _version: number;
}

export const TEAM_SCHEMA = `
    teams (
        _id VARCHAR(100) NOT NULL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        _version INT DEFAULT 0
    )
`