import {Schema, Document, Types, model} from "mongoose";

interface ReplyDoc extends Document {
    content: string;
    postId: string;
    teamId: string;
    createdBy: Types.ObjectId;
    createdAt: Date;
}

const ReplySchema = new Schema({
    content: {
        type: String,
        required: true,
        maxlength: 2048
    },
    postId: {
        type: String,
        required: true
    },
    teamId: {
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
    versionKey: false
})

const Reply = model<ReplyDoc>("Reply", ReplySchema);

export default Reply;