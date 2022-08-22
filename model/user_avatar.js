const mongoose = require('mongoose');

const userAvatarSchema = new mongoose.Schema(
{
    profile_url   : { type: String }, 
    sort  : { type: Number },
},
{
    timestamps: true
});

const UserAvatars = mongoose.model('user_avatar', userAvatarSchema);

module.exports = UserAvatars;