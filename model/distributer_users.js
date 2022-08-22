const mongoose = require('mongoose');

const distributerUserSchema = new mongoose.Schema(
{
    id : { type: Number },
    user_name : { type: String },
    password : { type: String },
    unique_id  : { type: String }, 
    email      : { type: String },
    web_password    : { type: String }, 
    chips : { type: Number, default : 0 }, 
    game_winning : { type: Number, default : 0 }, 
    flags : { 
        is_online : { type: Number, default : 0 },
        is_block: { type: Number, default : 0 },
    },
    cards_16_config : {
        commission : { type: Number, default : 0 }
    },
    refferal_id : { type: mongoose.Schema.Types.ObjectId, ref: SuperDistributerUsers },
},
{
    timestamps: true
});

const DistributerUsers = mongoose.model('distributer_user', distributerUserSchema);

module.exports = DistributerUsers;