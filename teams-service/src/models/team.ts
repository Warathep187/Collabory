import {Schema, Document, model} from "mongoose";

interface TeamDoc extends Document {
    hostId: string;
    name: string;
    image: {
        url: string;
        key: string;
    };
    description: string;
    members: string[];
    createdAt: Date;
    _version: number;
}

const TeamSchema = new Schema({
    hostId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 128
    },
    image: {
        key: {
            type: String,
            default: ""
        },
        url: {
            type: String,
            default: "https://c8.alamy.com/comp/R18X30/friends-young-people-faces-group-cartoon-vector-illustration-graphic-design-R18X30.jpg"
        }
    },
    description: {
        type: String,
        default: "",
        maxlength: 1024,
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    createdAt: {
        type: Date,
        required: true,
    },
    _version: {
        type: Number,
        default: 0
    }
}, {
    versionKey: false
})

const Team = model<TeamDoc>("Team", TeamSchema);

export default Team;