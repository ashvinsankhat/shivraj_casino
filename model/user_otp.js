const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpSchema = new Schema(
    {
        mobile_number: { type: String },
        otp: { type: Number },
        new_user: { type: Boolean, default: false },
        refer_code: { type: String, default : "" },
        code_verify: { type: Boolean, default: false },
    },
    {
        timestamps: true
    });

const UserOtp = mongoose.model('user_otp', otpSchema);

module.exports = UserOtp;