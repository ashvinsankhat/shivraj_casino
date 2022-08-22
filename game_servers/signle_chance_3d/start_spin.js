const { check_winner } = require("./check_winner");
const { get_admin_game_info } = require("./admin_game_info");
const fortuna = require("javascript-fortuna");
fortuna.init();
const { adminCommissionTrack } = require("../admin_track");

module.exports.start_spin = async table_id => {
	try {
		let wh = {
			_id: table_id,
		};
		let gameInfos = await SingleChance3dPlayings.findOne(wh, {});
		csl("start_spin gameInfos : ", gameInfos);

		let gameConfig = await GameConfigs.findOne({
			game_type: "single_chance_3d",
		}).lean();
		csl("start_spin gameConfig : ", gameConfig);

		let rewards = 0;

		let best_card_details = await this.get_best_card(gameInfos, gameConfig);
		csl("start_spin best_card_details : ", best_card_details);

		let best_card = best_card_details.cards;
		let x_reward = best_card_details.reward;

		if (x_reward != 0) {
			rewards = x_reward;
		}

		let track_cards = best_card + "|" + rewards;
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
		csl("start_spin wh , project 1: ", wh, updateData);

		let gameInfo = await SingleChance3dPlayings.findOneAndUpdate(
			wh,
			updateData,
			{
				new: true,
			}
		).lean();
		scl("single_chance_3d_start_spin userInfos : ", gameInfo);

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
			"SINGLE_CHANCE_3D_START_SPIN",
			response
		);

		get_admin_game_info(gameInfo);

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
		console.log("start_spin Exception : ", e);
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
		game_type: "single_chance_3d",
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

	let random_cards = await this.get_random_cards(gameInfo, no1, 0, bet_cards);
	csl("get_best_card  random_cards: ", random_cards);

	return random_cards;
};
module.exports.get_random_cards = async (gameInfo, no1, i1, bet_cards) => {
	if (i1 == 9) {
		let low_reward = await this.get_low_bet_cards(gameInfo);
		csl("get_random_cards low_reward: ", low_reward);
		return low_reward;
	}

	i1++;

	let cards = no1[i1];
	csl("get_random_cards  cards: ", cards);
	if (bet_cards.indexOf(cards) != -1) {
		return await this.get_random_cards(gameInfo, no1, i1, bet_cards);
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
	let sort_high_bet = this.sortJsonByValue(high_bet_cards);
	csl("get_low_bet_cards  sort_high_bet: ", sort_high_bet);

	let lowest_same_bet_cards = [];
	let lowest_bet = sort_high_bet[0][0];

	for (let i = 0; i < sort_high_bet.length; i++) {
		if (sort_high_bet[i][0] == lowest_bet) {
			lowest_same_bet_cards.push(sort_high_bet[i][1]);
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
	// if(Object.keys(high_bet_cards).length == 0){
	//     return {
	//         cards : "",
	//         reward : 0
	//     };
	// }
	let sort_high_bet = this.sortJsonByValue(high_bet_cards);
	csl("get_best_card  sort_high_bet: ", sort_high_bet);

	let winning_percentage = gameConfig.winning_percentage;
	csl("get_best_card  winning_percentage: ", winning_percentage);

	let n_reward =
		typeof gameInfo.game_config != "undefined" &&
		typeof gameInfo.game_config.REWARD_NORMAL != "undefined"
			? gameInfo.game_config.REWARD_NORMAL
			: 9;
	csl("get_best_card  n_reward: ", n_reward);

	let admin_bal = gameInfo.total_bet_amount;
	csl("get_best_card  admin_bal: ", admin_bal);

	let net_pay_amount = Number(admin_bal.toFixed(2));
	// let net_pay_amount = Number((admin_bal * ( winning_percentage / 100)).toFixed(2));
	csl("get_best_card  net_pay_amount: ", net_pay_amount);

	for (let i = sort_high_bet.length - 1; i >= 0; i--) {
		// csl(" cards winning : ", sort_high_bet[1], Number((sort_high_bet[0] / 5) * 70))
		if (Number((sort_high_bet[i][0] / 5) * n_reward) <= net_pay_amount) {
			return {
				cards: sort_high_bet[i][1],
				reward: 0,
			};
		}
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
		game_type: "single_chance_3d",
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
			game_type: "single_chance_3d",
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
