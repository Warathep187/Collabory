import {Schema, Document, model} from "mongoose";

interface TeamDoc extends Document {
    hostId: string;
}

const TeamSchema = new Schema({
    hostId: {
        type: String,
        required: true
    }
}, {
    versionKey: false
})

const Team = model<TeamDoc>("Team", TeamSchema);

export default Team;