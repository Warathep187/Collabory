import express from "express";
const app = express();
import cors from "cors";
import cookieSession from "cookie-session";
import mongoose from "mongoose";
import bodyParser from "body-parser";
require("dotenv").config();

import createTeamRouter from "./routes/create";
import getTeamsRouter from "./routes/teams";
import editTeamRouter from "./routes/edit";
import memberManagementRouter from "./routes/member-management";

import { connectToNatsStreaming } from "./services/nats-streaming";

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

app.use("/api/teams", createTeamRouter);
app.use("/api/teams", getTeamsRouter);
app.use("/api/teams", editTeamRouter);
app.use("/api/teams", memberManagementRouter);

app.listen(8002, async () => {
    console.log("Ready on port 8002");
    try {
        await mongoose.connect(process.env.MONGO_URL!);
        console.log("MongoDB is connected");
        await connectToNatsStreaming();
    } catch (e) {
        console.log(e);
    }
});
