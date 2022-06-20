import {Document, Schema, model} from "mongoose";

interface AuthDoc extends Document {
    email: string;
    password: string;
    resetPasswordCode: string;
    loginFail: {
        fail: number;
        canSignInAgainAt: Date
    };
    createdAt: Date;
}

const AuthSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordCode: {
        type: String,
        default: "",
    },
    loginFail: {
        fail: {
            type: Number,
            default: 0,
            min: 0
        },
        canSignInAgainAt: Date
    },
    createdAt: {
        type: Date,
        required: true,
    }
}, {
    versionKey: false
})

const Auth = model<AuthDoc>("Auth", AuthSchema);

export default Auth;