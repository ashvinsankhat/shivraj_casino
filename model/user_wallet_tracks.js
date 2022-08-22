const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userWalletTracksSchema = new Schema(
    {
        user_id   : { type: mongoose.Schema.Types.ObjectId, ref: GameUser },
        id       : { type : Number },
        unique_id: { type : String },
        trnx_type : { type : String },
        trnx_type_txt : { type : String },
        trnx_amount : { type : Number },
        opening_bal : { type : Number },
        op_game_winning : { type : Number },
        game_winning : { type : Number },
        total_bucket : { type : Number },
        deposit_id : { type : String },
        withdraw_id : { type : String },
        game_id   : { type: String, default : "" },
        is_robot : { type : Number },
        game_type : { type : String },
        max_seat : { type : Number },
        bet_value : { type : Number },
        table_id : { type : String },
        tournament_id :{ type : Number},
    },
    {
        timestamps: true
    }
);

const UserWalletTracks = mongoose.model('user_wallet_track', userWalletTracksSchema);
module.exports = UserWalletTracks;