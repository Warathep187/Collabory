import express from "express";
const app = express();
import cors from "cors";
import cookieSession from "cookie-session";
import bodyParser from "body-parser";
require("dotenv").config();

import notificationRouter from "./routes/notifications";

import { connectToNatsStreaming } from "./services/nats-streaming";
import { connectToMysql } from "./services/mysql-connecting";

app.use(cors());
app.use(
    express.json({
        limit: "10mb",
    })
);
app.use(
    bodyParser.urlencoded({
        limit: "10mb",
        extended: true,
    })
);
app.use(
    cookieSession({
        name: "authentication",
        keys: ["Collabory"],
        httpOnly: true,
        maxAge: (process.env.MODE === "DEV" ? 60 * 60 * 24 * 7 : 60 * 60 * 24) * 1000,
    })
);
app.set("trust proxy", true);

app.use("/api/notifications", notificationRouter);

app.listen(8003, async () => {
    console.log("Ready on port 8003");
    try {
        await connectToNatsStreaming();
        await connectToMysql();
    } catch (e) {
        console.log(e);
    }
});
