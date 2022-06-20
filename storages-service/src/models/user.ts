import {Schema, Document, model} from "mongoose";

interface UserDoc extends Document {
    name: string;
    teams: string[];
    _version: number;
}

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    teams: [
        String
    ],
    _version: {
        type: Number,
        default: 0
    }
}, {
    versionKey: false
})

const User = model<UserDoc>("User", UserSchema);

export default User;