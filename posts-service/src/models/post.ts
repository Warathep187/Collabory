import {Schema, Document, model, Types} from "mongoose";

interface PostDoc extends Document {
    title: string;
    content: string;
    teamId: string;
    likes: Types.ObjectId[];
    createdBy: Types.ObjectId;
    createdAt: Date
}

const PostSchema = new Schema({
    title: {
        type: String,
        maxlength: 256,
        required: true,
    },
    content: {
        type: String,
        maxlength: 2048,
    },
    teamId: {
        type: String,
        required: true
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
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

const Post = model<PostDoc>("Post", PostSchema);

export default Post;