const { check_winner } = require("./check_winner");
const { get_admin_game_info } = require("./admin_game_info");
const { adminCommissionTrack } = require("../admin_track");

const fortuna = require("javascript-fortuna");
fortuna.init();

module.exports.test_start_spin = async () => {
	let gameInfos = {
		_id: "62c40684003a0152cb72189e",
		game_config: {
			COMMISSION: 0,
			REWARD_X: 0,
			REWARD_NORMAL: 70,
			DRAW_TIME: 90,
			SPIN_TIME: 5,
			NEXT_GAME_TIME: 2,
		},
		game_id: "TMBYVSDZPJ3D",
		game_state: "game_timer_start",
		user_total_bet_amount: 44.8,
		total_bet_amount: -874.0499999999996,
		winners: 0,
		win_card: "5-6-0",
		winner_users: [],
		last_win_cards: ["2-1-9", "9-0-4", "1-2-3", "2-0-6", "0-8-3", "5-6-0"],
		next_deal_time: "10:02",
		createdAt: "2022-07-05T09:38:12.748Z",
		updatedAt: "2022-07-30T16:32:19.263Z",
		__v: 0,
		bet_users_cards: { "62dd66ebcd98eed504043e83": ["DG5OC51GSR"] },
		game_time: {
			init_time: "2022-07-30T16:30:56.908Z",
			gst_time: "2022-07-30T16:30:58.913Z",
		},
		total_bet_on_cards: {
			"0-0-0": 5,
			"0-0-1": 4,
			"0-0-2": 4,
			"0-0-3": 4,
			"0-0-4": 3,
			"0-0-5": 3,
			"0-0-6": 3,
			"0-0-7": 3,
			"0-0-8": 3,
			"0-0-9": 3,
			"0-1-0": 2,
			"0-1-1": 2,
			"0-1-2": 1,
			"0-8-8": 1,
			"0-8-9": 1,
			"0-9-8": 1,
			"0-9-9": 1,
			"9-7-8": 1,
			"9-7-9": 1,
			"9-8-6": 1,
			"9-8-7": 1,
			"9-8-8": 1,
			"9-8-9": 1,
			"9-9-6": 3,
			"9-9-7": 1,
			"9-9-8": 1,
			"9-9-9": 1,
		},
		user_bets: {
			0: 2,
			1: 2,
			2: 2,
			3: 2,
			4: 1,
			5: 1,
			6: 1,
			7: 1,
			8: 1,
			9: 1,
			"0-0": 2,
			"0-0-0": 1,
			"0-0-1": 1,
			"0-0-2": 1,
			"0-0-3": 1,
			"0-0-4": 1,
			"0-0-5": 1,
			"0-0-6": 1,
			"0-0-7": 1,
			"0-0-8": 1,
			"0-0-9": 1,
			"0-1": 1,
			"0-1-0": 1,
			"0-1-1": 1,
			"0-1-2": 1,
			"0-2": 1,
			"0-3": 1,
			"0-4": 1,
			"0-5": 1,
			"0-6": 1,
			"0-7": 1,
			"0-8": 1,
			"0-9": 1,
			"1-0": 1,
			"1-1": 1,
			"8-8": 1,
			"8-9": 1,
			"9-7-8": 1,
			"9-7-9": 1,
			"9-8": 1,
			"9-8-6": 1,
			"9-8-7": 1,
			"9-8-8": 1,
			"9-8-9": 1,
			"9-9": 1,
			"9-9-6": 3,
			"9-9-7": 1,
			"9-9-8": 1,
			"9-9-9": 1,
		},
		game_type: "triple_chance",
	};
	let gameConfig = await GameConfigs.findOne({
		game_type: "triple_chance",
	}).lean();
	csl("start_spin gameConfig : ", gameConfig);

	let rewards = 0;

	let admin_bal = gameInfos.total_bet_amount;
	csl("start_spin  admin_bal: ", admin_bal);

	// let net_pay_amount = 0;

	// if (admin_bal > 0) {
	// 	net_pay_amount = Number(
	// 		(admin_bal * (winning_percentage / 100)).toFixed(2)
	// 	);
	// }
	// csl("start_spin  net_pay_amount: ", net_pay_amount);

	// gameInfos.total_bet_amount = net_pay_amount;

	let best_card_details = await this.get_best_card(gameInfos, gameConfig);
	scl("start_spin best_card_details : ", best_card_details);
};
module.exports.start_spin = async table_id => {
	try {
		let wh = {
			_id: table_id,
		};
		let gameInfos = await TriplePlayings.findOne(wh, {});
		csl("start_spin gameInfos : ", gameInfos);

		let gameConfig = await GameConfigs.findOne({
			game_type: "triple_chance",
		}).lean();
		csl("start_spin gameConfig : ", gameConfig);

		let rewards = 0;

		let admin_bal = gameInfos.total_bet_amount;
		csl("start_spin  admin_bal: ", admin_bal);

		// let net_pay_amount = 0;

		// if (admin_bal > 0) {
		// 	net_pay_amount = Number(
		// 		(admin_bal * (winning_percentage / 100)).toFixed(2)
		// 	);
		// }
		// csl("start_spin  net_pay_amount: ", net_pay_amount);

		// gameInfos.total_bet_amount = net_pay_amount;

		let best_card_details = await this.get_best_card(gameInfos, gameConfig);
		scl("start_spin best_card_details : ", best_card_details);

		let best_card = best_card_details.cards;
		let x_reward = best_card_details.reward;

		if (x_reward != 0) {
			rewards = x_reward;
		}

		let track_cards = best_card;
		csl("start_spin track_cards : ", track_cards);

		let updateData = {
			$set: {
				game_state: "start_spin",
				win_card: best_card,
				"game_time.spin_time": new Date(),
				"game_config.REWARD_X": x_reward,
			},
			$push: {
				last_win_cards: track_cards,
			},
		};
		// if (gameInfos.user_total_bet_amount > 0 && admin_bal > 0) {
		// 	updateData["$set"]["total_bet_amount"] = net_pay_amount;

		// }
		csl("start_spin wh , project 1: ", wh, updateData);

		let gameInfo = await TriplePlayings.findOneAndUpdate(wh, updateData, {
			new: true,
		}).lean();
		scl("triple_chance_start_spin userInfos : ", gameInfo);

		let timer =
			typeof gameInfo.game_config != "undefined" &&
			typeof gameInfo.game_config.SPIN_TIME != "undefined"
				? gameInfo.game_config.SPIN_TIME
				: 5;
		csl("start_spin timer : ", timer);

		let response = {
			timer: timer,
			win_card: best_card,
			reward: rewards,
		};
		respSendActions.FireEventToTable(
			gameInfo._id.toString(),
			"TRIPLE_START_SPIN",
			response
		);

		await get_admin_game_info(gameInfo);

		let job_id = "SPT:" + gameInfo._id;
		const turnExpireTime = await commonClass.AddTime(timer + 5);
		csl("start_spin : ", job_id, new Date(), new Date(turnExpireTime));

		let tab_id = gameInfo._id;
		const delayRes = await scheduleClass.setScheduler(
			job_id,
			new Date(turnExpireTime)
		);
		csl("start_spin  delayRes: ", delayRes);

		await check_winner(tab_id);

		return true;
	} catch (e) {
		console.log("spin exception : ", e);
		return false;
	}
};
module.exports.get_best_card = async gameInfo => {
	csl("get_best_card  gameInfo: ", gameInfo);

	for (let key in gameInfo.total_bet_on_cards) {
		if (gameInfo.total_bet_on_cards[key] == 0) {
			delete gameInfo.total_bet_on_cards[key];
		}
	}
	csl(
		"get_best_card  gameInfo.total_bet_on_cards: ",
		gameInfo.total_bet_on_cards
	);

	let gameConfig = await GameConfigs.findOne({
		game_type: "triple_chance",
	}).lean();
	csl("get_best_card  gameConfig: ", gameConfig);

	if (gameConfig == null) {
		gameConfig = {
			reward_x: 0,
			reward_card: "",
			winning_percentage: 80.0,
			win_loss_user: {},
		};
	}

	let x_reward = await this.get_x_reward_cards(gameConfig);
	csl("get_best_card  x_reward: ", x_reward);

	if (x_reward.cards != "") {
		return x_reward;
	}

	let percentage_reward = await this.get_percentage_based_cards(
		gameInfo,
		gameConfig
	);
	csl("get_best_card  percentage_reward: ", percentage_reward);

	if (percentage_reward.cards != "") {
		return percentage_reward;
	}

	let bet_cards = Object.keys(gameInfo.total_bet_on_cards);
	csl("get_best_card  bet_cards: ", bet_cards);

	let no1 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	no1 = this.shuffle(no1);
	let no2 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	no2 = this.shuffle(no2);
	let no3 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	no3 = this.shuffle(no3);

	let all_bet_keys = Object.keys(gameInfo.user_bets);
	csl("get_best_card  all_bet_keys: ", all_bet_keys);

	let random_cards = await this.get_random_cards(
		gameInfo,
		no1,
		no2,
		no3,
		0,
		0,
		0,
		bet_cards,
		all_bet_keys
	);
	csl("get_best_card  random_cards: ", random_cards);

	return random_cards;
};
module.exports.get_random_cards = async (
	gameInfo,
	no1,
	no2,
	no3,
	i1,
	i2,
	i3,
	bet_cards,
	all_bet_keys
) => {
	if (i1 == 9 && i2 == 9 && i3 == 9) {
		let low_reward = await this.get_low_bet_cards(gameInfo);
		csl("get_random_cards low_reward: ", low_reward);
		return low_reward;
	}

	if (i3 == 9) {
		i3 = 0;
		if (i2 == 9) {
			i2 = 0;
			i1++;
		} else {
			i2++;
		}
	} else {
		i3++;
	}
	let cards = no1[i1] + "-" + no2[i2] + "-" + no3[i3];
	// csl("get_random_cards  cards: ", cards);
	let triple_number = no1[i1] + "-" + no2[i2] + "-" + no3[i3];
	let double_number = no2[i2] + "-" + no3[i3];

	if (
		all_bet_keys.indexOf(triple_number) != -1 ||
		all_bet_keys.indexOf(double_number) != -1 ||
		all_bet_keys.indexOf(no3[i3]) != -1
	) {
		return await this.get_random_cards(
			gameInfo,
			no1,
			no2,
			no3,
			i1,
			i2,
			i3,
			bet_cards,
			all_bet_keys
		);
	} else {
		return {
			cards: cards,
			reward: 0,
		};
	}
};
module.exports.get_x_reward_cards = async gameConfig => {
	let x_cards_deatils = gameConfig;
	csl("get_best_card  x_cards_deatils: ", x_cards_deatils);
	if (x_cards_deatils == null) {
		return {
			cards: "",
			reward: 0,
		};
	}
	if (x_cards_deatils.reward_card != "") {
		return {
			cards: x_cards_deatils.reward_card,
			reward: x_cards_deatils.reward_x,
		};
	} else {
		return {
			cards: "",
			reward: 0,
		};
	}
};
module.exports.get_low_bet_cards = async (gameInfo, gameConfig) => {
	let high_bet_cards = gameInfo.total_bet_on_cards;
	csl("get_low_bet_cards  high_bet_cards: ", high_bet_cards);
	// if(Object.keys(high_bet_cards).length == 0){
	//     return {
	//         cards : "",
	//         reward : 0
	//     };
	// }
	let user_bets = gameInfo.user_bets;
	csl("get_low_bet_cards  user_bets: ", user_bets);

	let admin_bal = gameInfo.total_bet_amount;
	// csl("get_best_card  admin_bal: ", admin_bal);

	let net_pay_amount = Number(admin_bal.toFixed(2));

	let sort_high_bet = this.sortJsonByValue(user_bets);
	csl("get_best_card  sort_high_bet: ", sort_high_bet);

	let in_percentage_card = {};
	for (let i = sort_high_bet.length - 1; i >= 0; i--) {
		csl("get_best_card  sort_high_bet: ", sort_high_bet[i]);
		let cnumber = sort_high_bet[i][1];
		if (cnumber.length == 5) {
			let number_split = cnumber.split("-");

			let triplebet = user_bets[cnumber] ? user_bets[cnumber] : 0;

			let double_bet = user_bets[number_split[1] + "-" + number_split[2]]
				? user_bets[number_split[1] + "-" + number_split[2]]
				: 0;

			let single_bet = user_bets[number_split[2]]
				? user_bets[number_split[2]]
				: 0;
			let net_win_amount = triplebet * 990 + double_bet * 90 + single_bet * 9;

			// if (Number(net_win_amount) <= Number(net_pay_amount)) {
			in_percentage_card[cnumber] = net_win_amount;
			// }
		} else if (cnumber.length == 3) {
			// let number = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
			for (let i = 0; i <= 9; i++) {
				let temp_cnumber = i + "-" + cnumber;

				let number_split = temp_cnumber.split("-");

				let triplebet = user_bets[temp_cnumber] ? user_bets[temp_cnumber] : 0;

				let double_bet = user_bets[cnumber] ? user_bets[cnumber] : 0;

				let single_bet = user_bets[number_split[2]]
					? user_bets[number_split[2]]
					: 0;
				let net_win_amount = triplebet * 990 + double_bet * 90 + single_bet * 9;

				// if (Number(net_win_amount) <= Number(net_pay_amount)) {
				in_percentage_card[temp_cnumber] = net_win_amount;
				// }
			}
		} else if (cnumber.length == 1) {
			for (let i = 0; i <= 9; i++) {
				for (let j = 0; j <= 9; j++) {
					let temp_cnumber = i + "-" + j + "-" + cnumber;

					let triplebet = user_bets[temp_cnumber] ? user_bets[temp_cnumber] : 0;

					let double_bet = user_bets[j + "-" + cnumber]
						? user_bets[j + "-" + cnumber]
						: 0;

					let single_bet = user_bets[cnumber] ? user_bets[cnumber] : 0;

					let net_win_amount =
						triplebet * 990 + double_bet * 90 + single_bet * 9;

					// if (Number(net_win_amount) <= Number(net_pay_amount)) {
					in_percentage_card[temp_cnumber] = net_win_amount;
					// }
				}
			}
		}
	}
	let final_bet_slot = this.sortJsonByValue(in_percentage_card);
	csl("get_best_card  final_bet_slot: ", final_bet_slot);

	let lowest_same_bet_cards = [];
	let lowest_bet = final_bet_slot[0][0];

	for (let i = 0; i < final_bet_slot.length; i++) {
		if (final_bet_slot[i][0] == lowest_bet) {
			lowest_same_bet_cards.push(final_bet_slot[i][1]);
		}
	}
	csl("get_low_bet_cards  lowest_same_bet_cards: ", lowest_same_bet_cards);

	let ran = parseInt(fortuna.random() * lowest_same_bet_cards.length);
	let cards = lowest_same_bet_cards[ran];

	csl("get_low_bet_cards  cards: ", cards);

	return {
		cards: cards,
		reward: 0,
	};
};
module.exports.get_percentage_based_cards = async (gameInfo, gameConfig) => {
	let high_bet_cards = gameInfo.total_bet_on_cards;
	csl("get_best_card  high_bet_cards: ", high_bet_cards);

	let admin_bal = gameInfo.total_bet_amount;
	// csl("get_best_card  admin_bal: ", admin_bal);

	let net_pay_amount = Number(admin_bal.toFixed(2));
	// let net_pay_amount = Number((admin_bal * ( winning_percentage / 100)).toFixed(2));
	// csl("get_best_card  net_pay_amount: ", net_pay_amount);

	let user_bets = gameInfo.user_bets;

	let sort_high_bet = this.sortJsonByValue(user_bets);
	csl("get_best_card  sort_high_bet: ", sort_high_bet);

	let in_percentage_card = {};
	for (let i = sort_high_bet.length - 1; i >= 0; i--) {
		csl("get_best_card  sort_high_bet: ", sort_high_bet[i]);
		let cnumber = sort_high_bet[i][1];
		if (cnumber.length == 5) {
			let number_split = cnumber.split("-");

			let triplebet = user_bets[cnumber] ? user_bets[cnumber] : 0;

			let double_bet = user_bets[number_split[1] + "-" + number_split[2]]
				? user_bets[number_split[1] + "-" + number_split[2]]
				: 0;

			let single_bet = user_bets[number_split[2]]
				? user_bets[number_split[2]]
				: 0;
			let net_win_amount = triplebet * 990 + double_bet * 90 + single_bet * 9;

			if (Number(net_win_amount) <= Number(net_pay_amount)) {
				in_percentage_card[cnumber] = net_win_amount;
			}
		} else if (cnumber.length == 3) {
			// let number = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
			for (let i = 0; i <= 9; i++) {
				let temp_cnumber = i + "-" + cnumber;

				let number_split = temp_cnumber.split("-");

				let triplebet = user_bets[temp_cnumber] ? user_bets[temp_cnumber] : 0;

				let double_bet = user_bets[cnumber] ? user_bets[cnumber] : 0;

				let single_bet = user_bets[number_split[2]]
					? user_bets[number_split[2]]
					: 0;
				let net_win_amount = triplebet * 990 + double_bet * 90 + single_bet * 9;

				if (Number(net_win_amount) <= Number(net_pay_amount)) {
					in_percentage_card[temp_cnumber] = net_win_amount;
				}
			}
		} else if (cnumber.length == 1) {
			for (let i = 0; i <= 9; i++) {
				for (let j = 0; j <= 9; j++) {
					let temp_cnumber = i + "-" + j + "-" + cnumber;

					let triplebet = user_bets[temp_cnumber] ? user_bets[temp_cnumber] : 0;

					let double_bet = user_bets[j + "-" + cnumber]
						? user_bets[j + "-" + cnumber]
						: 0;

					let single_bet = user_bets[cnumber] ? user_bets[cnumber] : 0;

					let net_win_amount =
						triplebet * 990 + double_bet * 90 + single_bet * 9;

					if (Number(net_win_amount) <= Number(net_pay_amount)) {
						in_percentage_card[temp_cnumber] = net_win_amount;
					}
				}
			}
		}
	}

	if (Object.keys(in_percentage_card).length > 0) {
		let final_bet_slot = this.sortJsonByValue(in_percentage_card);
		csl("get_best_card  final_bet_slot: ", final_bet_slot);

		let max_same_bet_cards = [];
		let max_bet = final_bet_slot[final_bet_slot.length - 1][0];

		for (let i = 0; i < final_bet_slot.length; i++) {
			if (final_bet_slot[i][0] == max_bet) {
				max_same_bet_cards.push(final_bet_slot[i][1]);
			}
		}
		csl("get_best_card  max_same_bet_cards: ", max_same_bet_cards);

		let ran = parseInt(fortuna.random() * max_same_bet_cards.length);
		let cards = max_same_bet_cards[ran];
		return {
			cards: cards,
			reward: 0,
		};
	}
	return {
		cards: "",
		reward: 0,
	};
};
module.exports.sortJsonByValue = jsObj => {
	const arr = Object.keys(jsObj).map(el => {
		return [jsObj[el], el];
	});
	arr.sort((a, b) => {
		return a[0] - b[0];
	});
	return arr;
};
module.exports.shuffle = o => {
	if (typeof o == "undefined" || o == null) return [];

	for (
		var j, x, i = o.length;
		i;
		j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x
	);
	return o;
};
module.exports.get_selected_cards = async gameInfo => {
	csl("get_best_card  gameInfo: ", gameInfo);

	let x_cards_deatils = await GameConfigs.findOne({
		game_type: "triple_chance",
	}).lean();
	csl("get_best_card  x_cards_deatils: ", x_cards_deatils);

	if (x_cards_deatils == null) {
		return {
			cards: "",
			reward: 0,
		};
	}
	if (
		x_cards_deatils.win_loss_user != "undefiend" &&
		x_cards_deatils.win_loss_user.user_id != "undefiend"
	) {
		let user_type = x_cards_deatils.win_loss_user.user_type;

		let retailers = x_cards_deatils.win_loss_user.user_id;

		if (user_type == "distributer") {
			let wh = {
				refferal_id: {
					$in: retailers,
				},
			};
			retailers = await GameUser.distinct("_ic", wh).lean();
			csl("get_best_card retailers : ", retailers);
		}

		let wh1 = {
			game_id: gameInfo.game_id,
			game_type: "triple_chance",
		};
		let retailers_bets = await Lucky16CardTracks.find(wh1, {});
		csl("add_winning_amount retailers_bets :", retailers_bets);
	} else {
		return {
			cards: "",
			reward: 0,
		};
	}
};
