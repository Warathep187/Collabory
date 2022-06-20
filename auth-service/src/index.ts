import express from "express";
const app = express();
import bodyParser from "body-parser";
import cookieSession from "cookie-session";
require("dotenv").config();
import mongoose from "mongoose";
const cors = require("cors");

import signInRouter from "./routes/sign-in";
import signupRouter from "./routes/signup";
import verificationRouter from "./routes/verification";
import resetPasswordRouter from "./routes/reset-password";
import changePasswordRouter from "./routes/change-password";
import logoutRouter from "./routes/logout";

import { connectToRedis } from "./services/caching-actions";
import { connectToNatsStreaming } from "./services/nats-streaming";

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
app.set("trust proxy", true);
app.use(
    cookieSession({
        name: "authentication",
        keys: ["Collabory"],
        httpOnly: true,
        maxAge: (process.env.MODE === "DEV" ? 60 * 60 * 24 * 7 : 60 * 60 * 24) * 1000,
    })
);
app.use(cors());

app.use("/api/auth", signInRouter);
app.use("/api/auth", signupRouter);
app.use("/api/auth", verificationRouter);
app.use("/api/auth", resetPasswordRouter);
app.use("/api/auth", changePasswordRouter);
app.use("/api/auth", logoutRouter);

app.listen(8000, async () => {
    console.log("Ready on port 8000");
    try {
        await connectToRedis();
        console.log("Redis is connected");
        await mongoose.connect(process.env.MONGO_URL!);
        console.log("MongoDB is connected");
        await connectToNatsStreaming();
    } catch (e) {
        console.log(e);
    }
});

export default app;
