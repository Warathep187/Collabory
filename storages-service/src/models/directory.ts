import {Schema, Document, model} from "mongoose";

interface DirectoryDoc extends Document {
    name: string;
    teamId: string;
    inDirectory: string | null;
    createdBy: Schema.Types.ObjectId;
    createdAt: Date;
}

const DirectorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    teamId: {
        type: String,
        required: true
    },
    inDirectory: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        required: true
    }
}, {
    versionKey: false,
})

const Directory = model<DirectoryDoc>("Directory", DirectorySchema);

export default Directory;