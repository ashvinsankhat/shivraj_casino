const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminCutTracksSchema = new Schema(
	{
		game_id: { type: String, default: "" },
		game_type: { type: String, default: "" },
		total_bet_amount: { type: Number, default: 0 },
		total_win_amount: { type: Number, default: 0 },
		commission_amount: { type: Number, default: 0 },
	},
	{
		timestamps: true,
	}
);

const AdminCommissionTracks = mongoose.model(
	"admin_commission_track",
	adminCutTracksSchema
);
module.exports = AdminCommissionTracks;
