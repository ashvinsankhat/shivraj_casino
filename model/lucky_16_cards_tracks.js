const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lucky16CardTracksSchema = new Schema(
    {
        user_id   : { type: mongoose.Schema.Types.ObjectId, ref: GameUser },
        game_id   : { type: String, default : "" },
        game_type : { type: String, default : "" },
        ticket_id : { type: String, default : "" },
        total_bet_amount : { type: Number, default : 0 },
        total_win_amount : { type: Number, default : 0 },
        x_reward_amount : { type: Number, default : 0 },
        commission_amount : { type: Number, default : 0 },
        total_end_amount : { type: Number, default : 0 },
        result_card : { type: String, default : "" },
        card_details : { },
        draw_time : { type: Date, default : new Date() },
        status    : { type: Number, default : 0 },
    },
    {
        timestamps: true
    }
);

const Lucky16CardTracks = mongoose.model('lucky_16_cards_track', lucky16CardTracksSchema);
module.exports = Lucky16CardTracks;