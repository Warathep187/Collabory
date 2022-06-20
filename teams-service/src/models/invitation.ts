import {Schema, Document, model} from "mongoose";

interface InvitationDoc extends Document {
    userId: string;
    teamId: string;
    createdAt: Date
}

const InvitationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    teamId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true
    }
}, {
    versionKey: false
})

const Invitation = model<InvitationDoc>("Invitation", InvitationSchema);

export default Invitation;