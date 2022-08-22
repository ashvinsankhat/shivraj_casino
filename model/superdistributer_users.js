const mongoose = require('mongoose');

const superDistributerUserSchema = new mongoose.Schema(
{
    id : { type: Number },
    display_user_name: { type: String , default : ""},
    user_name : { type: String },
    password : { type: String },
    unique_id    : { type: String }, 
    chips        : { type: Number, default : 0 }, 
    game_winning : { type: Number, default : 0 }, 
    refferal_code   : { type: String, default : "" },
    email      : { type: String },
    web_password    : { type: String }, 
    flags : { 
        is_online : { type: Number, default : 0 },
        is_block : { type: Number, default : 0 }
    },
    lasts : {
        last_login : { type: Date, default : new Date() }
    },
    counters : {
        game_win  : { type: Number, default : 0 },
        game_loss : { type: Number, default : 0 }
    },
    cards_16_config : {
        commission : { type: Number, default : 0 }
    },
    table_id : { type: String, default : ""},
    sck_id   : { type: String },
    refferal_id : { type: mongoose.Schema.Types.ObjectId, ref: Users },
},
{
    timestamps: true
});

const SuperDistributerUsers = mongoose.model('superdistributer_user', superDistributerUserSchema);

module.exports = SuperDistributerUsers;