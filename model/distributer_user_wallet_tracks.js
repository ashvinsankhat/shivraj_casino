const mongoose = require('mongoose');

const distributerUserWalletTracks = new mongoose.Schema(
{
    user_id   : { type: mongoose.Schema.Types.ObjectId},
    trnx_amount : { type : Number },
    type : { type : Number },
    opening_bal : { type : Number },
    opening_game_winning : { type : Number },
    final_game_winning : { type : Number },
    total_bucket : { type : Number },
    retailer_id  : { type: mongoose.Schema.Types.ObjectId},
    game_type : { type : String }
},
{
    timestamps: true
});

const DistributerUserWalletTracks = mongoose.model('distributer_user_wallet_track', distributerUserWalletTracks);

module.exports = DistributerUserWalletTracks;