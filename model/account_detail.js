const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountDetailsSchema = new Schema(
    {
        user_id   : { type: mongoose.Schema.Types.ObjectId, ref: GameUser },
        adhar_url: { type: String, default : "" },
        adhar_status: { type: Boolean, default : false },
        pan_url: { type: String, default : "" },
        pan_status: { type: Boolean, default : false },
        
        name: { type: String, default : "" },
        ifsc: { type: String, default : "" },
        accno: { type: String, default : "" },
        mobile: { type: String, default : "" },
        upi: { type: String, default : "" },
        reason: { type: String, default : "" },
    },
    {
        timestamps: true
    });

const AccountDetails = mongoose.model('account_detail', accountDetailsSchema);

module.exports = AccountDetails;