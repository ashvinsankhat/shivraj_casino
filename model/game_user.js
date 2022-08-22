const mongoose = require("mongoose");

const gameUserSchema = new mongoose.Schema(
	{
		id: { type: Number },
		display_user_name: { type: String, default: "" },
		user_name: { type: String },
		password: { type: String },
		unique_id: { type: String },
		chips: { type: Number, default: 0 },
		game_winning: { type: Number, default: 0 },
		commision_chips: { type: Number, default: 0 },
		refferal_code: { type: String, default: "" },
		refferal_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: DistributerUsers,
		},
		super_refferal_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: DistributerUsers,
		},
		flags: {
			is_online: { type: Number, default: 0 },
		},
		lasts: {
			last_login: { type: Date, default: new Date() },
		},
		counters: {
			game_win: { type: Number, default: 0 },
			game_loss: { type: Number, default: 0 },
		},
		cards_16_config: {
			auto_claim: { type: Boolean, default: false },
			commission: { type: Number, default: 0 },
		},
		rejoin: { type: Boolean, default: false },
		sck_id: { type: String },
	},
	{
		timestamps: true,
	}
);

const GameUser = mongoose.model("game_user", gameUserSchema);

module.exports = GameUser;
