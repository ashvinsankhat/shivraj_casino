const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
{
    name : { type: String },
    password : { type: String },
    role    : { type: String }, 
    email      : { type: String },
},
{
    timestamps: true
});

const Users = mongoose.model('user', userSchema);

module.exports = Users;