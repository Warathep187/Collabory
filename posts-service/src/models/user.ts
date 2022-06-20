import {Schema, Document, model} from "mongoose";

interface UserDoc extends Document {
    name: string;
    profileImageUrl: string;
    teams: string[];
    _version: number;
}

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    profileImageUrl: {
        type: String,
        default: "https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg"
    },
    teams: [String],
    _version: {
        type: Number,
        default: 0
    }
}, {
    versionKey: false
})

const User = model<UserDoc>("User", UserSchema);

export default User;