const { check_winner } = require("./check_winner");
const { get_admin_game_info } = require("./admin_game_info");
const fortuna = require("javascript-fortuna");
const { adminCommissionTrack } = require("../admin_track");
fortuna.init();

module.exports.start_spin = async table_id => {
	try {
		let wh = {
			_id: table_id,
		};
		let gameInfos = await LuckyCardPlayings.findOne(wh, {}).lean();
		csl("start_spin gameInfos : ", gameInfos);

		let gameConfig = await GameConfigs.findOne({
			game_type: "lucky_cards_16",
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

		let gameInfo = await LuckyCardPlayings.findOneAndUpdate(wh, updateData, {
			new: true,
		}).lean();
		scl("lucky_cards_16_start_spin userInfos : ", gameInfo);

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
			"LUCKY_CARD_START_SPIN",
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
		console.log("Exception start_spin ::", e);
		return false;
	}
};
module.exports.get_best_card = async (gameInfo, gameConfig) => {
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

	csl("get_best_card  gameConfig: ", gameConfig);

	if (gameConfig == null) {
		gameConfig = {
			reward_x: 0,
			reward_card: "",
			winning_percentage: 80.0,
			win_loss_user: {},
		};
	}

	let specific_cards = await this.get_user_percentage_selected_cards(
		gameInfo,
		gameConfig
	);
	csl("get_best_card specific_cards: ", specific_cards);

	if (specific_cards.cards != "") {
		return specific_cards;
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

	let uCards = [
		"k-11",
		"k-12",
		"k-13",
		"k-14",
		"f-11",
		"f-12",
		"f-13",
		"f-14",
		"l-11",
		"l-12",
		"l-13",
		"l-14",
		"c-11",
		"c-12",
		"c-13",
		"c-14",
	];
	let all_cards = await this.shuffle(uCards);
	let random_cards = await this.get_random_cards(
		gameInfo,
		all_cards,
		0,
		bet_cards
	);
	csl("get_best_card  random_cards: ", random_cards);

	return random_cards;
};
module.exports.get_random_cards = async (
	gameInfo,
	all_cards,
	index,
	bet_cards
) => {
	let cards = all_cards[index];
	csl("get_random_cards  cards: ", cards);
	if (index == 15) {
		let low_reward = await this.get_low_bet_cards(gameInfo);
		csl("get_random_cards low_reward: ", low_reward);

		return low_reward;
	}
	if (bet_cards.indexOf(cards) != -1) {
		return await this.get_random_cards(
			gameInfo,
			all_cards,
			index + 1,
			bet_cards
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

	let x_reward =
		typeof gameConfig.reward_x != "undefined" &&
		typeof gameConfig.reward_x != "undefined"
			? gameConfig.reward_x
			: 0;
	let n_reward =
		typeof gameInfo.game_config != "undefined" &&
		typeof gameInfo.game_config.REWARD_NORMAL != "undefined"
			? gameInfo.game_config.REWARD_NORMAL
			: 70;
	csl("get_percentage_based_cards x_reward, n_reward : ", x_reward, n_reward);

	let sort_high_bet = this.sortJsonByValue(high_bet_cards);
	csl("get_best_card  sort_high_bet: ", sort_high_bet);

	let winning_percentage = gameConfig.winning_percentage;
	csl("get_best_card  winning_percentage: ", winning_percentage);

	let admin_bal = gameInfo.total_bet_amount;
	csl("get_best_card  admin_bal: ", admin_bal);

	// let net_pay_amount = Number((admin_bal * ( winning_percentage / 100)).toFixed(2));
	let net_pay_amount = Number(admin_bal);
	csl("get_best_card  net_pay_amount: ", net_pay_amount);
	let in_percentage_card = [];
	for (let i = sort_high_bet.length - 1; i >= 0; i--) {
		// csl(" cards winning : ", sort_high_bet[1], Number((sort_high_bet[0] / 5) * 70))
		let bet_count = sort_high_bet[i][0] / 5;
		let win_amount = Number(bet_count) * n_reward;

		if (x_reward != 0) win_amount = win_amount * x_reward;

		if (Number(win_amount) <= net_pay_amount) {
			in_percentage_card.push(sort_high_bet[i][1]);
		}
	}
	if (in_percentage_card.length > 0) {
		let ran = parseInt(fortuna.random() * in_percentage_card.length);
		let cards = in_percentage_card[ran];
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
module.exports.get_user_percentage_selected_cards = async (
	gameInfo,
	gameConfig
) => {
	csl("\n\nget_user_percentage_selected_cards  gameInfo: ", gameInfo);
	csl("get_user_percentage_selected_cards  gameConfig: ", gameConfig);

	if (
		gameConfig.win_loss_user != "undefiend" &&
		gameConfig.win_loss_user.user_id != "undefiend"
	) {
		let retailers = Object.keys(gameConfig.win_loss_user.user_id);
		csl("\nget_user_percentage_selected_cards  retailers: ", retailers);

		let total_bet_on_cards = gameInfo.total_bet_on_cards;
		csl(
			"\nget_user_percentage_selected_cards total_bet_on_cards: ",
			total_bet_on_cards
		);

		retailers = retailers.map(e => {
			return MongoID(e);
		});

		let user_specific_bonus = gameConfig.win_loss_user.user_id;
		csl(
			"\nget_user_percentage_selected_cards  user_specific_bonus: ",
			user_specific_bonus
		);

		let wh1 = {
			user_id: {
				$in: retailers,
			},
			game_id: gameInfo.game_id,
			game_type: "lucky_cards_16",
		};
		let project_data = {
			user_id: 1,
			card_details: 1,
		};
		csl(
			"get_user_percentage_selected_cards wh1, project_data :",
			wh1,
			project_data
		);

		let user_bet_info = await Lucky16CardTracks.find(wh1, project_data);
		csl("get_user_percentage_selected_cards user_bet_info :", user_bet_info);

		if (user_bet_info.length == 0) {
			return {
				cards: "",
				reward: 0,
			};
		}
		let speci_bet_cards = {};
		let speci_bet_user = {};
		let speci_bet_user_count = {};
		for (let i = 0; i < user_bet_info.length; i++) {
			let cards_bet = user_bet_info[i].card_details;
			csl("cards_bet : ", cards_bet);

			for (let key in cards_bet) {
				if (typeof speci_bet_cards[key] != "undefined") {
					let object = {};
					object[user_bet_info[i].user_id] = cards_bet[key];

					speci_bet_user[key].push(object);
					speci_bet_user_count[key] = speci_bet_user_count[key] + 1;
					speci_bet_cards[key] = speci_bet_cards[key] + cards_bet[key];
				} else {
					let object = {};
					object[user_bet_info[i].user_id] = cards_bet[key];
					speci_bet_user[key] = [object];
					speci_bet_cards[key] = cards_bet[key];
					speci_bet_user_count[key] = 1;
				}
			}
		}
		speci_bet_user_count = await this.sortJsonByValue(speci_bet_user_count);

		let x_reward =
			typeof gameConfig.reward_x != "undefined" &&
			typeof gameConfig.reward_x != "undefined"
				? gameConfig.reward_x
				: 0;
		let n_reward =
			typeof gameInfo.game_config != "undefined" &&
			typeof gameInfo.game_config.REWARD_NORMAL != "undefined"
				? gameInfo.game_config.REWARD_NORMAL
				: 70;
		csl("get_best_card x_reward, n_reward : ", x_reward, n_reward);

		let available_cards = [];
		for (let i = speci_bet_user_count.length - 1; i >= 0; i--) {
			// if(speci_bet_user_count[i][0] == speci_bet_user[speci_bet_user_count[i][1]].length){
			let retailer_bets_data = speci_bet_user[speci_bet_user_count[i][1]];
			// console.log("retailer_bets_data : ", retailer_bets_data);
			let avail = [];
			let total_win_amount = 0;
			for (let j = 0; j < retailer_bets_data.length; j++) {
				// console.log("retailer_bets_data[i] : ", retailer_bets_data[j]);
				let user_id = Object.keys(retailer_bets_data[j])[0];
				// console.log("user_id : ", user_id);
				let bet_value = retailer_bets_data[j][user_id];
				let bet_count = bet_value / 5;
				let win_amount = Number(bet_count) * n_reward;

				if (x_reward != 0) win_amount = win_amount * x_reward;

				csl(
					"\nget_user_percentage_selected_cards win_amount : ",
					speci_bet_user_count[i][1],
					win_amount,
					Number(user_specific_bonus[user_id])
				);

				let pay_amount =
					Number(
						(
							Number(gameInfo.total_bet_amount) *
							(Number(user_specific_bonus[user_id]) / 100)
						).toFixed(2)
					) - total_win_amount;
				csl(
					"get_user_percentage_selected_cards pay_amount : ",
					pay_amount,
					win_amount,
					total_win_amount,
					Number(gameInfo.total_bet_amount),
					pay_amount <= Number(gameInfo.total_bet_amount)
				);

				if (
					pay_amount > 0 &&
					win_amount <= pay_amount &&
					win_amount <= Number(gameInfo.total_bet_amount)
				) {
					total_win_amount = total_win_amount + win_amount;
					avail.push(user_id);
				}
			}
			let other_bet =
				total_bet_on_cards[speci_bet_user_count[i][1]] -
				speci_bet_cards[speci_bet_user_count[i][1]];
			csl(
				"get_user_percentage_selected_cards other_bet : ",
				other_bet,
				total_bet_on_cards[speci_bet_user_count[i][1]],
				speci_bet_cards[speci_bet_user_count[i][1]]
			);

			let total_remaing_amount =
				Number(gameInfo.total_bet_amount) - total_win_amount;
			csl(
				"get_user_percentage_selected_cards total_remaing_amount: ",
				total_win_amount,
				total_remaing_amount
			);

			let bet_count = other_bet / 5;
			let win_amount = Number(bet_count) * n_reward;

			if (x_reward != 0) win_amount = win_amount * x_reward;

			// console.log("win_amount : ", win_amount);

			let admin_bal = gameInfo.total_bet_amount;
			csl(
				"get_user_percentage_selected_cards admin_bal: ",
				win_amount,
				admin_bal
			);

			let net_pay_amount = Number(admin_bal);
			// let net_pay_amount = Number((admin_bal * ( winning_percentage / 100)).toFixed(2));
			csl(
				"get_user_percentage_selected_cards  win_amount, net_pay_amount: ",
				other_bet,
				win_amount,
				net_pay_amount,
				total_remaing_amount
			);

			if (
				avail.length == retailer_bets_data.length &&
				total_remaing_amount > 0 &&
				Number(win_amount) <= total_remaing_amount
			) {
				available_cards.push(speci_bet_user_count[i][1]);
			}
			// }
		}
		csl(
			"\nget_user_percentage_selected_cards available_cards : ",
			available_cards
		);
		if (available_cards.length == 0) {
			return {
				cards: "",
				reward: 0,
			};
		}
		let ran = parseInt(fortuna.random() * available_cards.length);
		let cards = available_cards[ran];

		return {
			cards: cards,
			reward: x_reward,
		};
	} else {
		return {
			cards: "",
			reward: 0,
		};
	}
};
/* module.exports.get_selected_cards = async(gameInfo, gameConfig) => {
    
    csl("\n\nget_selected_cards  gameInfo: ", gameInfo);
    csl("get_selected_cards  gameConfig: ", gameConfig);

    if(gameConfig.win_loss_user != "undefiend" && gameConfig.win_loss_user.user_id != "undefiend" ){
        
        
        let retailers = Object.keys(gameConfig.win_loss_user.user_id);
        csl("\nget_selected_cards  retailers: ", retailers);    
        
        let total_bet_on_cards = gameInfo.total_bet_on_cards;
        csl("\nget_selected_cards total_bet_on_cards: ", total_bet_on_cards);

        retailers  = retailers.map((e) => {
            return MongoID(e)
        });

        let user_specific_bonus = gameConfig.win_loss_user.user_id;
        csl("\nget_selected_cards  user_specific_bonus: ", user_specific_bonus);    

        let wh1 = {
            user_id  : {
                $in : retailers
            },
            game_id : gameInfo.game_id,
            game_type : "lucky_cards_16"            
        }
        let project_data = {
            user_id : 1,
            card_details : 1,
        }
        csl("get_selected_cards wh1, project_data :", wh1, project_data);
        
        let user_bet_info = await Lucky16CardTracks.find(wh1,project_data);
        csl("get_selected_cards user_bet_info :", user_bet_info);
        
        if(user_bet_info.length == 0){
            return {
                cards : "",
                reward : 0
            };
        }
        let speci_bet_cards = {};
        let speci_bet_user  = {};
        let speci_bet_user_count = {};
        for(let i = 0 ; i < user_bet_info.length ; i++){
        
            let cards_bet = user_bet_info[i].card_details;
            csl("cards_bet : ", cards_bet);

            for(let key in cards_bet){
                if(typeof speci_bet_cards[key] != "undefined"){
                
                    let object = {};
                    object[user_bet_info[i].user_id] = cards_bet[key]

                    speci_bet_user[key].push(object);
                    speci_bet_user_count[key] = speci_bet_user_count[key] + 1;
                    speci_bet_cards[key] = speci_bet_cards[key] + cards_bet[key];

                }else{

                    let object= {};
                    object[user_bet_info[i].user_id] = cards_bet[key]
                    speci_bet_user[key] = [object];
                    speci_bet_cards[key] = cards_bet[key]
                    speci_bet_user_count[key] = 1;

                }
            }
        }
        speci_bet_user_count = await this.sortJsonByValue(speci_bet_user_count);
        
        let x_reward = (typeof gameConfig.reward_x != "undefined" && typeof gameConfig.reward_x != "undefined")?gameConfig.reward_x : 0;
        let n_reward = (typeof gameInfo.game_config != "undefined" && typeof gameInfo.game_config.REWARD_NORMAL != "undefined")?gameInfo.game_config.REWARD_NORMAL : 70;
        csl("get_best_card x_reward, n_reward : ", x_reward, n_reward);
        
        let available_cards = [];
        for(let i =  speci_bet_user_count.length - 1 ; i >= 0  ; i--){

            // if(speci_bet_user_count[i][0] == speci_bet_user[speci_bet_user_count[i][1]].length){
                let retailer_bets_data = speci_bet_user[speci_bet_user_count[i][1]];
                // console.log("retailer_bets_data : ", retailer_bets_data);
                let avail = [];
                for(let j = 0 ; j < retailer_bets_data.length ; j++){
                    // console.log("retailer_bets_data[i] : ", retailer_bets_data[j]);
                    let user_id = Object.keys(retailer_bets_data[j])[0];
                    // console.log("user_id : ", user_id);
                    let bet_value = retailer_bets_data[j][user_id];
                    let bet_count = bet_value / 5;
                    let win_amount = Number(bet_count) * n_reward;
            
                    if(x_reward != 0)
                        win_amount = win_amount * x_reward
            
                    csl("get_best_card win_amount : ",speci_bet_user_count[i][1], win_amount, Number(user_specific_bonus[user_id]));
                    if( win_amount <= Number(user_specific_bonus[user_id])){
                        avail.push(user_id);
                    }
                }
                let other_bet = total_bet_on_cards[speci_bet_user_count[i][1]] - speci_bet_cards[speci_bet_user_count[i][1]];
                csl("get_best_card other_bet : ", other_bet, total_bet_on_cards[speci_bet_user_count[i][1]], speci_bet_cards[speci_bet_user_count[i][1]]);
               
                let bet_count = other_bet / 5;
                let win_amount = Number(bet_count) * n_reward;
            
                if(x_reward != 0)
                    win_amount = win_amount * x_reward
            
                // console.log("win_amount : ", win_amount);  
                
                let winning_percentage = gameConfig.winning_percentage;
                csl("get_best_card  winning_percentage: ", winning_percentage);

                let admin_bal = gameInfo.total_bet_amount;
                csl("get_best_card admin_bal: ", admin_bal);
            
                let net_pay_amount = Number((admin_bal * ( winning_percentage / 100)).toFixed(2));
                csl("get_best_card  win_amount, net_pay_amount: ", other_bet, win_amount, net_pay_amount);
            
                if(avail.length == retailer_bets_data.length && Number(win_amount) <= net_pay_amount){
                    available_cards.push(speci_bet_user_count[i][1])
                }
            // }
        }
        csl("get_best_card available_cards : ", available_cards);
        if(available_cards.length == 0){
            return {
                cards : "",
                reward : 0
            };
        }
        let ran = parseInt(fortuna.random() * available_cards.length);
        let cards = available_cards[ran];

        return {
            cards : cards,
            reward : x_reward
        };
    }else{
        return {
            cards : "",
            reward : 0
        };    
    }
}*/
