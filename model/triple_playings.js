const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TriplePlayingsSchema = new Schema(
	{
		user_id: { type: mongoose.Schema.Types.ObjectId, ref: GameUser },
		game_id: { type: String, default: "" },
		game_type: { type: String, default: "triple_chance" },
		game_state: { type: String, default: "" },
		game_time: {},
		user_total_bet_amount: { type: Number, default: 0 },
		total_bet_amount: { type: Number, default: 0 },
		winners: { type: Number, default: 0 },
		bet_users_cards: {},
		user_bets: {},
		win_card: { type: String, default: "" },
		winner_users: { type: Array, default: [] },
		last_win_cards: { type: Array, default: [] },
		next_deal_time: { type: String, default: "" },
		total_bet_on_cards: {},
		game_config: {
			COMMISSION: { type: Number, default: 0 },
			REWARD_X: { type: Number, default: 0 },
			REWARD_NORMAL: { type: Number, default: 70 },
			DRAW_TIME: { type: Number, default: 120 },
			SPIN_TIME: { type: Number, default: 5 },
			NEXT_GAME_TIME: { type: Number, default: 2 },
		},
	},
	{
		timestamps: true,
	}
);

const TriplePlayings = mongoose.model("triple_playing", TriplePlayingsSchema);
module.exports = TriplePlayings;
