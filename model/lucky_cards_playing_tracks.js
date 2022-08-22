const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LuckyCardPlayTracksSchema = new Schema(
    {
        user_id   : { type: mongoose.Schema.Types.ObjectId, ref: GameUser },
        game_id   : { type: String, default : "" },
        game_state   : { type: String, default : "" },
        game_time   : { },

        winners   : { type: Number, default : 0 },
        winners_counter   : { type: Number, default : 0 },
        loss_counter   : { type: Number, default : 0 },
        winning_amount   : { type: Number, default : 0 },
        user_total_bet_amount   : { type: Number, default : 0 },
        total_bet_amount   : { type: Number, default : 0 },
        bet_users_cards   : {},
        win_card :  { type: String, default : "" },
        winner_users: { type: Array, default : [] },
        last_win_cards   : { type: Array, default : [] }
    },
    {
        timestamps: true
    }
);

const LuckyCardPlayTracks = mongoose.model('lucky_cards_playing_track', LuckyCardPlayTracksSchema);
module.exports = LuckyCardPlayTracks;