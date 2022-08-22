const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const betListSchema = new Schema(
    {
        game_type   : { type: String }, // Game Type
        sub_type   : { type: String }, // Sub Type
        bet_value   : { type: Number },
        max_seat   : { type: Number },
        no_of_player_start_table : { type: Number }, // Round start player count
        rate : { type: Number },
        is_active : { type : Boolean }
    },
    {
        timestamps: true
    }
);

const BetLists = mongoose.model('bet_list', betListSchema);
module.exports = BetLists;