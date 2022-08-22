const mongoose = require('mongoose');

const avatarSchema = new mongoose.Schema(
{
    profile_url : { type: String }, 
    is_active   : { type: Boolean ,default : true}
},
{
    timestamps: true
});

const Avatar = mongoose.model('avatar', avatarSchema);

module.exports = Avatar;