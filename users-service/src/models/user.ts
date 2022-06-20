import { Schema, Document, model } from "mongoose";

interface UserDoc extends Document {
    email: string;
    name: string;
    profileImage: {
        key: string;
        url: string;
    };
    bio: string;
    unreadMessage: number;
    unreadNotification: number;
    _version: number;
}

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    profileImage: {
        key: {
            type: String,
            default: "",
        },
        url: {
            type: String,
            default: "https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg"
        }
    },
    bio: {
        type: String,
        default: "",
        maxlength: 1024
    },
    unreadMessage: {
        type: Number,
        default: 0,
        min: 0
    },
    unreadNotification: {
        type: Number,
        default: 0,
        min: 0
    },
    _version: {
        type: Number,
        default: 0
    }
}, {
    versionKey: false
})

const User = model<UserDoc>("User", UserSchema);

export default User;