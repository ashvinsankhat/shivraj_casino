const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameVersionSchema = new Schema(
    {
        version_type : { type : String },
        version      : { type : String },
        apkUrl       : { type : String },
        msg          : { type : String },
        status       : { type : Boolean }
    },{
        timestamps: true
    }
);

const GameVersions = mongoose.model('game_version', gameVersionSchema);
module.exports = GameVersions;