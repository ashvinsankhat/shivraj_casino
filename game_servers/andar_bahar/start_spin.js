const { check_winner } = require("./check_winner");
const { get_admin_game_info } = require("./admin_game_info");
const fortuna = require("javascript-fortuna");
fortuna.init();
module.exports.start_spin = async table_id => {
	try {
		let wh = {
			_id: table_id,
		};
		let gameInfos = await AndarBahars.findOne(wh, {});
		csl("start_spin gameInfos : ", gameInfos);

		let gameConfig = await GameConfigs.findOne({
			game_type: "andar_bahar",
		}).lean();
		csl("start_spin gameConfig : ", gameConfig);

		let rewards = 0;

		let best_card_details = await this.get_game_card(gameInfos, gameConfig);
		scl("andar_bahar_start_spin best_card_details : ", best_card_details);

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
				win_info: best_card_details,
			},
			$push: {
				last_win_cards: track_cards,
			},
		};
		csl("start_spin wh , project 1: ", wh, updateData);

		let gameInfo = await AndarBahars.findOneAndUpdate(wh, updateData, {
			new: true,
		}).lean();
		scl("andar_bahar_start_spin userInfos : ", gameInfo);

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
			deal_card: best_card_details.deal_card,
		};
		respSendActions.FireEventToTable(
			gameInfo._id.toString(),
			"ANDAR_BAHAR_START_SPIN",
			response
		);
		let time = timer * 1000 + 300 * best_card_details.deal_card.length;

		get_admin_game_info(gameInfo);

		let job_id = "SPT:" + gameInfo._id;
		const turnExpireTime = await commonClass.AddTimeInMilliseconds(time);
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
		console.log("Exception start_spin ::", e);
		return false;
	}
};
module.exports.get_game_card = async (gameInfos, gameConfig) => {
	let best_card_details = await this.get_best_card(gameInfos, gameConfig);
	csl("get_game_card best_card_details : ", best_card_details);

	let all_cards = [
		"k-1",
		"k-2",
		"k-3",
		"k-4",
		"k-5",
		"k-6",
		"k-7",
		"k-8",
		"k-9",
		"k-10",
		"k-11",
		"k-12",
		"k-13",
		"f-1",
		"f-2",
		"f-3",
		"f-4",
		"f-5",
		"f-6",
		"f-7",
		"f-8",
		"f-9",
		"f-10",
		"f-11",
		"f-12",
		"f-13",
		"l-1",
		"l-2",
		"l-3",
		"l-4",
		"l-5",
		"l-6",
		"l-7",
		"l-8",
		"l-9",
		"l-10",
		"l-11",
		"l-12",
		"l-13",
		"c-1",
		"c-2",
		"c-3",
		"c-4",
		"c-5",
		"c-6",
		"c-7",
		"c-8",
		"c-9",
		"c-10",
		"c-11",
		"c-12",
		"c-13",
	];

	let selected_cards = best_card_details.cards;
	let remaning_cards = [];
	let select_cards = [];
	for (let i = all_cards.length - 1; i > 0; i--) {
		// console.log("get_game_card  all_cards[i].split('-')[1] : ", all_cards[i].split('-'));
		// console.log("get_game_card  selected_cards.split("-")[1] : ", selected_cards.split("-")[1]);
		if (all_cards[i].split("-")[1] == selected_cards.split("-")[1]) {
			if (all_cards[i].split("-")[0] != selected_cards.split("-")[0])
				select_cards.push(all_cards[i]);
		} else {
			remaning_cards.push(all_cards[i]);
		}
	}

	csl("get_game_card  select_cards : ", select_cards);
	remaning_cards = this.shuffle(remaning_cards);
	csl("get_game_card  all_cards    : ", JSON.stringify(remaning_cards));

	let side_numbers = [4, 6, 8, 10, 12, 14];
	let ran = parseInt(fortuna.random() * side_numbers.length);
	let numb = side_numbers[ran];

	csl("get_game_card  numb: ", numb);

	let cut_number = numb;
	if (best_card_details.last_card_throw == "Bahar") {
		cut_number--;
	}
	let final_cards = remaning_cards.splice(0, cut_number);

	let lran = parseInt(fortuna.random() * select_cards.length);
	let lcards = select_cards[lran];
	final_cards.push(lcards);
	csl("get_game_card  final_cards    : ", JSON.stringify(final_cards));

	best_card_details.deal_card = final_cards;

	return best_card_details;
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
		game_type: "andar_bahar",
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

	let x_reward = await this.get_x_reward_cards(gameInfo, gameConfig);
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

	let no1 = [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"11",
		"12",
		"13",
	];
	no1 = this.shuffle(no1);

	let colors = ["l", "c", "k", "f"];
	colors = this.shuffle(colors);

	let sides = ["Under", "Bahar"];
	sides = this.shuffle(sides);

	let random_cards = await this.get_random_cards(
		gameInfo,
		no1,
		colors,
		sides,
		0,
		0,
		0,
		bet_cards
	);
	csl("get_best_card  random_cards: ", random_cards);

	return random_cards;
};
module.exports.get_random_cards = async (
	gameInfo,
	no1,
	colors,
	sides,
	i1,
	i2,
	i3,
	bet_cards
) => {
	let total_bet_on_cards = gameInfo.total_bet_on_cards;

	if (i1 == 12 && i2 == 3 && i3 == 1) {
		let card_details = await this.get_low_cards_slots(gameInfo);
		return card_details;
	}

	if (i3 == 1) {
		i3 = 0;
		if (i2 == 3) {
			i1++;
			i2 = 0;
		} else {
			i2++;
		}
	} else {
		i3++;
	}
	let pay_no_amount =
		typeof total_bet_on_cards[no1[i1].toString()] != "undefined"
			? Math.round(Number(total_bet_on_cards[no1[i1].toString()]) * 12)
			: 0;
	let pay_col_amount =
		typeof total_bet_on_cards[colors[i2].toString()] != "undefined"
			? Math.round(Number(total_bet_on_cards[colors[i2].toString()]) * 3.75)
			: 0;
	let pay_sid_amount =
		typeof total_bet_on_cards[sides[i3].toString()] != "undefined"
			? Math.round(Number(total_bet_on_cards[sides[i3].toString()]) * 2)
			: 0;

	let total_pay_amount = pay_no_amount + pay_col_amount + pay_sid_amount;
	console.log("get_best_card  i1, i2, i3 :: ", i1, i2, i3, total_pay_amount);

	if (Number(total_pay_amount) > Number(gameInfo.total_bet_amount)) {
		return await this.get_random_cards(
			gameInfo,
			no1,
			colors,
			sides,
			i1,
			i2,
			i3,
			bet_cards
		);
	} else {
		let color = "k";
		if (colors[i2] == "c") {
			color = "c";
		} else if (colors[i2] == "l") {
			color = "l";
		} else if (colors[i2] == "f") {
			color = "f";
		}
		let cards = color + "-" + no1[i1].toString();

		return {
			cards: cards,
			reward: 0,
			last_card_throw: sides[i3].toString(),
		};
	}
};
module.exports.get_low_cards_slots = async gameInfo => {
	let total_bet_on_cards = gameInfo.total_bet_on_cards;

	let best_number = [];

	let numbers = [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"11",
		"12",
		"13",
	];
	let colors = ["l", "c", "k", "f"];
	let sides = ["Under", "Bahar"];

	for (let i = 0; i < numbers.length; i++) {
		let pay_no_amount =
			typeof total_bet_on_cards[numbers[i]] != "undefined"
				? Math.round(Number(total_bet_on_cards[numbers[i]]) * 12)
				: 0;

		for (let j = 0; j < colors.length; j++) {
			let pay_col_amount =
				typeof total_bet_on_cards[colors[j]] != "undefined"
					? Math.round(Number(total_bet_on_cards[colors[j]]) * 3.75)
					: 0;

			for (let k = 0; k < sides.length; k++) {
				let pay_sid_amount =
					typeof total_bet_on_cards[sides[k]] != "undefined"
						? Math.round(Number(total_bet_on_cards[sides[k]]) * 2)
						: 0;

				let total_amount = pay_sid_amount + pay_col_amount + pay_no_amount;

				let color = "k";
				if (colors[j] == "c") {
					color = "c";
				} else if (colors[j] == "l") {
					color = "l";
				} else if (colors[j] == "f") {
					color = "f";
				}

				let cards = color + "-" + numbers[i];
				best_number.push({
					cards: cards,
					reward: 0,
					win_amount: total_amount,
					last_card_throw: sides[k],
				});
			}
		}
	}

	best_number = best_number.sort((a, b) => {
		return a.win_amount - b.win_amount;
	});

	let lowest_slots = [];
	let lowest_bet_value = best_number[0].win_amount;
	for (let i = 0; i < best_number.length; i++) {
		if (lowest_bet_value == best_number[i].win_amount) {
			lowest_slots.push(best_number[i]);
		}
	}
	let ran = parseInt(fortuna.random() * lowest_slots.length);
	let cards = lowest_slots[ran];
	csl("get_low_cards_slots cards : ", cards);

	return cards;
};
module.exports.get_x_reward_cards = async (gameInfo, gameConfig) => {
	let x_cards_deatils = gameConfig;
	csl("get_best_card  x_cards_deatils: ", x_cards_deatils);
	if (x_cards_deatils == null) {
		return {
			cards: "",
			reward: 0,
			last_card_throw: "",
		};
	}
	if (x_cards_deatils.reward_card != "") {
		return {
			cards: x_cards_deatils.reward_card,
			reward: x_cards_deatils.reward_x,
			last_card_throw: x_cards_deatils.reward_andar_bahar,
		};
	} else {
		return {
			cards: "",
			reward: 0,
			last_card_throw: "",
		};
	}
};
/* 
     if(x_cards_deatils.reward_card == "Under" || x_cards_deatils.reward_card == "Bahar"){
            
            let numbers = {};
            let colors = {};
            for(let keys in high_bet_cards){
                if(["1","2","3","4","5","6","7","8","9","10","11","12","13"].indexOf(Number(keys)) != -1){
                    numbers[keys] = high_bet_cards[keys];
                }
                if(["l","c","k","f"].indexOf(keys) != -1){
                    colors[keys] = high_bet_cards[keys];
                }
            }
            csl("get_best_card  numbers: ", numbers);
            let low_number_cards = await this.get_low_bet_cards(numbers);
            csl("get_best_card  low_number_cards: ", low_number_cards);
        
            let low_color_cards = await this.get_low_bet_cards(colors);
            csl("get_best_card  low_color_cards: ", low_color_cards);
        
            let color = "k";
            if(low_color_cards.cards == "c"){
                color = "c";
            }else if(low_color_cards.cards == "l"){
                color = "l";
            }else if(low_color_cards.cards == "f"){
                color = "f";
            }
            let cards = color + "-" + low_number_cards.cards;
            csl("get_best_card  final cards :: ", cards);
        
            return {
                cards : cards,
                reward :  x_cards_deatils.reward_x,
                last_card_throw : x_cards_deatils.reward_card
            }

        }else if(
            x_cards_deatils.reward_card == "c" || x_cards_deatils.reward_card == "l"
            || x_cards_deatils.reward_card == "k" || x_cards_deatils.reward_card == "f"
        ){
            
            let numbers = {};
            let colors = {};
            for(let keys in high_bet_cards){
                if(["1","2","3","4","5","6","7","8","9","10","11","12","13"].indexOf(Number(keys)) != -1){
                    numbers[keys] = high_bet_cards[keys];
                }
                if(["Under","Bahar"].indexOf(keys) != -1){
                    colors[keys] = high_bet_cards[keys];
                }
            }
            csl("get_best_card  numbers: ", numbers);
            let low_number_cards = await this.get_low_bet_cards(numbers);
            csl("get_best_card  low_number_cards: ", low_number_cards);
        
            let low_color_cards = await this.get_low_bet_cards(colors);
            csl("get_best_card  low_color_cards: ", low_color_cards);
        
            let color = "k";
            if(x_cards_deatils.reward_card == "c"){
                color = "c";
            }else if(x_cards_deatils.reward_card == "l"){
                color = "l";
            }else if(x_cards_deatils.reward_card == "f"){
                color = "f";
            }
            let cards = color + "-" + low_number_cards.cards;
            csl("get_best_card  final cards :: ", cards);
        
            return {
                cards : cards,
                reward : x_cards_deatils.reward_x,
                last_card_throw : low_color_cards.cards
            }

        }else if(["1","2","3","4","5","6","7","8","9","10","11","12","13"].indexOf(Number(x_cards_deatils.reward_card)) != -1){
            
            let numbers = {};
            let colors = {};
            for(let keys in high_bet_cards){
                if(["Under","Bahar"].indexOf(keys) != -1){
                    numbers[keys] = high_bet_cards[keys];
                }
                if(["l","c","k","f"].indexOf(keys) != -1){
                    colors[keys] = high_bet_cards[keys];
                }
            }
            csl("get_best_card  numbers: ", numbers);
            let low_number_cards = await this.get_low_bet_cards(numbers);
            csl("get_best_card  low_number_cards: ", low_number_cards);
        
            let low_color_cards = await this.get_low_bet_cards(colors);
            csl("get_best_card  low_color_cards: ", low_color_cards);
        
            let color = "k";
            if(low_color_cards.cards == "c"){
                color = "c";
            }else if(low_color_cards.cards == "l"){
                color = "l";
            }else if(low_color_cards.cards == "f"){
                color = "f";
            }
            let cards = lcolor + "-" + x_cards_deatils.reward_card;
            csl("get_best_card  final cards :: ", cards);
        
            return {
                cards : cards,
                reward :  x_cards_deatils.reward_x,
                last_card_throw : low_number_cards.cards
            }

        }else {
            return {
                cards : "",
                reward : 0,
                last_card_throw : ""
            };
        }
 */
module.exports.get_low_bet_cards = async total_bet_on_cards => {
	let high_bet_cards = total_bet_on_cards;
	csl("get_low_bet_cards  high_bet_cards: ", high_bet_cards);
	// if(Object.keys(high_bet_cards).length == 0){
	//     return {
	//         cards : "",
	//         reward : 0,
	//         last_card_throw : ""
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
		last_card_throw: "",
	};
};
module.exports.get_percentage_based_cards = async (gameInfo, gameConfig) => {
	let high_bet_cards = gameInfo.total_bet_on_cards;

	if (Object.keys(high_bet_cards).length == 0) {
		return {
			cards: "",
			reward: 0,
			last_card_throw: "",
		};
	}
	let numbers = {};
	let colors = {};
	let sides = {};

	for (let keys in high_bet_cards) {
		if (
			[
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9",
				"10",
				"11",
				"12",
				"13",
			].indexOf(keys) != -1
		) {
			numbers[keys] = high_bet_cards[keys];
		}
		if (["l", "c", "k", "f"].indexOf(keys) != -1) {
			colors[keys] = high_bet_cards[keys];
		}
		if (["Under", "Bahar"].indexOf(keys) != -1) {
			sides[keys] = high_bet_cards[keys];
		}
	}
	let admin_bal = gameInfo.total_bet_amount;
	csl("get_best_card  admin_bal: ", admin_bal);

	let net_pay_amount = Number(admin_bal.toFixed(2));

	let best_number = [];

	let all_numbers = [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"11",
		"12",
		"13",
	];
	let all_colors = ["l", "k", "f", "c"];
	let all_sides = ["Under", "Bahar"];

	if (Object.keys(numbers).length > 0) {
		for (let no in numbers) {
			let pay_no_amount = Math.round(Number(numbers[no]) * 12);

			if (pay_no_amount < net_pay_amount) {
				if (Object.keys(colors).length > 0) {
					for (let cols in colors) {
						let pay_col_amount = Number(colors[cols]) * 3.75;
						if (pay_col_amount + pay_no_amount < net_pay_amount) {
							let color = "k";
							if (cols == "c") {
								color = "c";
							} else if (cols == "l") {
								color = "l";
							} else if (cols == "f") {
								color = "f";
							}
							if (Object.keys(sides).length > 0) {
								for (let side in sides) {
									let pay_side_amount = Number(sides[side]) * 2;
									if (
										pay_side_amount + pay_col_amount + pay_no_amount <
										net_pay_amount
									) {
										let cards = color + "-" + no;
										best_number.push({
											cards: cards,
											reward: 0,
											win_amount:
												pay_side_amount + pay_col_amount + pay_no_amount,
											last_card_throw: side,
										});
									}
								}
							} else {
								let ran = parseInt(fortuna.random() * all_sides.length);
								let sides = all_sides[ran];

								let cards = color + "-" + no;
								best_number.push({
									cards: cards,
									reward: 0,
									win_amount: pay_col_amount + pay_no_amount,
									last_card_throw: sides,
								});
							}
						}
					}
				} else {
					if (Object.keys(sides).length > 0) {
						for (let side in sides) {
							let pay_side_amount = Number(sides[side]) * 2;
							if (pay_side_amount + pay_no_amount < net_pay_amount) {
								let ran = parseInt(fortuna.random() * all_colors.length);
								let color = all_colors[ran];

								let cards = color + "-" + no;
								best_number.push({
									cards: cards,
									reward: 0,
									win_amount: pay_side_amount + pay_no_amount,
									last_card_throw: side,
								});
							}
						}
					} else {
						let ran = parseInt(fortuna.random() * all_colors.length);
						let color = all_colors[ran];

						let ran1 = parseInt(fortuna.random() * all_sides.length);
						let sides = all_sides[ran1];

						let cards = color + "-" + no;
						best_number.push({
							cards: cards,
							reward: 0,
							win_amount: pay_no_amount,
							last_card_throw: sides,
						});
					}
				}
			}
		}
	} else {
		let ran = parseInt(fortuna.random() * all_numbers.length);
		let no = all_numbers[ran];

		if (Object.keys(colors).length > 0) {
			for (let cols in colors) {
				let pay_col_amount = Number(colors[cols]) * 3.75;
				if (pay_col_amount < net_pay_amount) {
					let color = "k";
					if (cols == "c") {
						color = "c";
					} else if (cols == "l") {
						color = "l";
					} else if (cols == "f") {
						color = "f";
					}
					if (Object.keys(sides).length > 0) {
						for (let side in sides) {
							let pay_side_amount = Number(sides[side]) * 2;
							if (pay_side_amount + pay_col_amount < net_pay_amount) {
								let cards = color + "-" + no;
								best_number.push({
									cards: cards,
									reward: 0,
									win_amount: pay_side_amount + pay_col_amount,
									last_card_throw: side,
								});
							}
						}
					} else {
						let ran = parseInt(fortuna.random() * all_sides.length);
						let sides = all_sides[ran];

						let cards = color + "-" + no;
						best_number.push({
							cards: cards,
							reward: 0,
							win_amount: pay_col_amount,
							last_card_throw: sides,
						});
					}
				}
			}
		} else {
			if (Object.keys(sides).length > 0) {
				for (let side in sides) {
					let pay_side_amount = Number(sides[side]) * 2;
					if (pay_side_amount < net_pay_amount) {
						let ran = parseInt(fortuna.random() * all_colors.length);
						let color = all_colors[ran];

						let cards = color + "-" + no;
						best_number.push({
							cards: cards,
							reward: 0,
							win_amount: pay_side_amount,
							last_card_throw: side,
						});
					}
				}
			}
		}
	}
	if (best_number.length > 0) {
		let ran = parseInt(fortuna.random() * best_number.length);
		let cards = best_number[ran];
		csl("get_low_bet_cards  cards: ", cards);
		return cards;
	}
	return {
		cards: "",
		reward: 0,
		last_card_throw: "",
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
		game_type: "andar_bahar",
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
			game_type: "andar_bahar",
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
