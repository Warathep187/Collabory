import {Schema, Document, model} from "mongoose";

interface FileDoc extends Document {
    name: string;
    teamId: string;
    inDirectory: string | null;
    source: {
        key: string;
        url: string;
    }
    createdBy: Schema.Types.ObjectId;
    createdAt: Date;
}

const FileSchema = new Schema({
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
    source: {
        key: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
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
    versionKey: false
})

const File = model<FileDoc>("File", FileSchema);

export default File;