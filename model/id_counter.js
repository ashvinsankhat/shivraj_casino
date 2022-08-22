const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const idCounterSchema = new Schema(
    {
        type    : { type: String },
        counter : { type: Number },
    },
    {
        timestamps: true
    }
);

const IdCounter = mongoose.model('id_counter', idCounterSchema);
module.exports = IdCounter;