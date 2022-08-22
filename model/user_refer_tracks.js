const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserReferTracksSchema = new Schema(
    {
        user_id : { type: mongoose.Schema.Types.ObjectId, ref: GameUser },
        rId : { type: mongoose.Schema.Types.ObjectId, ref: GameUser },
    },
    {
        timestamps: true
    }
);

const UserReferTracks = mongoose.model('user_refer_track', UserReferTracksSchema);
module.exports = UserReferTracks;