const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userReportTracksSchema = new Schema(
    {
        user_id    : { type: mongoose.Schema.Types.ObjectId, ref: GameUser },
        user_name  : { type: String, default : ""},
        play_amount    : { type: Number, default : 0},
        win_amount     : { type: Number, default : 0},
        claim_amount   : { type: Number, default : 0},
        unclaim_amount : { type: Number, default : 0},
        end_amount   : { type: Number, default : 0},
        commission_amount   : { type: Number, default : 0},
        ntp_amount   : { type: Number, default : 0},
        date : { type: String, default : ""},
    },
    {
        timestamps: true
    }
);

const UserReportTracks = mongoose.model('user_report_track', userReportTracksSchema);
module.exports = UserReportTracks;