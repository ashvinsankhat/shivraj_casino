const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const depositTracksSchema = new Schema(
    {
        user_id   : { type: mongoose.Schema.Types.ObjectId, ref: GameUser },
        deposit_id : { type : String },
        trnx_amount : { type : Number },
        checksum  : {  },
        status    : { type : String },
        method    : { type : String },
    },
    {
        timestamps: true
    }
);

const DepositTracks = mongoose.model('deposit_track', depositTracksSchema);
module.exports = DepositTracks;