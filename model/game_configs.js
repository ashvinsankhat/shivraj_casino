const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameConfigSchema = new Schema(
    {
        "game_type" : { type: String, default : "" },
        "reward_x"  : { type: Number, default : 0 },
        "reward_card" :  { type: String, default : "" },
        "winning_percentage" :  { type: Number, default : 0 },
        "win_loss_user" : { 
        }
    },
    {
        timestamps: true
    }
);

const GameConfigs = mongoose.model('game_configs', GameConfigSchema);
module.exports = GameConfigs;