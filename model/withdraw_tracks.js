const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const withdrawTracksSchema = new Schema(
    {
        user_id   : { type: mongoose.Schema.Types.ObjectId, ref: GameUser },
        withdraw_id : { type : String },
        status    : { type : String },
        trnx_amount : { type : Number },
        name    : { type : String },
        ifsc    : { type : String },
        accno   : { type : String },
        mobile  : { type : String },
        upi     : { type : String },
    },
    {
        timestamps: true
    }
);

const WithdrawTracks = mongoose.model('withdraw_track', withdrawTracksSchema);
module.exports = WithdrawTracks;