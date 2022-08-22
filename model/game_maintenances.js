const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameMaintenanceSchema = new Schema(
    {
        startTime : { type : Date },
        endTime : { type : Date },
        status : { type : Boolean }
    },
    {
        timestamps: true
    }
);

const GameMaintenances = mongoose.model('game_maintenance', gameMaintenanceSchema);
module.exports = GameMaintenances;