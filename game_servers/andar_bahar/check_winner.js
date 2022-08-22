const { finish_round } = require("./finish");
const { addWallet } = require("./wallet_update");
const {
	win_tracks,
	loss_tracks,
	claim_tracks,
	unclaim_tracks,
} = require("./report_track");

const { get_admin_game_info } = require("./admin_game_info");

module.exports.check_winner = async table_id => {
	let wh1 = {};
	let gameInfos = await AndarBahars.findOne(wh1, {}).lean();
	csl("check_winner userInfos : ", gameInfos);

	let init_timer =
		typeof gameInfos.game_config != "undefined" &&
		typeof gameInfos.game_config.NEXT_GAME_TIME != "undefined"
			? gameInfos.game_config.NEXT_GAME_TIME
			: 5;
	csl("check_winner init_timer : ", init_timer);

	let game_timer =
		typeof gameInfos.game_config != "undefined" &&
		typeof gameInfos.game_config.DRAW_TIME != "undefined"
			? gameInfos.game_config.DRAW_TIME
			: 60;
	csl("check_winner game_timer : ", game_timer);

	let spin_timer =
		typeof gameInfos.game_config != "undefined" &&
		typeof gameInfos.game_config.SPIN_TIME != "undefined"
			? gameInfos.game_config.SPIN_TIME
			: 5;
	csl("check_winner spin_timer : ", spin_timer);

	let add_timer = init_timer + game_timer + spin_timer;
	csl("check_winner add_timer : ", add_timer);

	let ndt_date = await commonClass.AddTime(add_timer);
	csl("check_winner ndt_date : ", ndt_date);

	let cdate_format = await commonClass.AddTimeWithDate(new Date(), 19800);
	csl("check_winner cdate_format : ", cdate_format);

	let date_format = await commonClass.AddTimeWithDate(
		new Date(ndt_date),
		19800
	);
	csl("check_winner date_format : ", date_format);

	let format = dateFormat(date_format, "h:MM");
	csl("check_winner format : ", format);

	let wh = {
		_id: table_id,
	};
	let updateData = {
		$set: {
			game_state: "winner_declare",
			next_deal_time: format,
		},
	};
	csl("check_winner wh , project 1: ", wh, updateData);

	let gameInfo = await AndarBahars.findOneAndUpdate(wh, updateData, {
		new: true,
	}).lean();
	scl("andar_bahar_check_winner userInfos : ", gameInfo);

	if (gameInfo.last_win_cards.length > 5) {
		const lastCards = gameInfo.last_win_cards.slice(-5);
		csl("check_winner lastCards : ", lastCards);

		updateData = {
			$set: {
				last_win_cards: lastCards,
			},
		};
		csl("check_winner wh , project 1: ", wh, updateData);

		gameInfo = await AndarBahars.findOneAndUpdate(wh, updateData, {
			new: true,
		}).lean();
		csl("check_winner userInfos : ", gameInfo);
	}

	let response = {
		win_card: gameInfo.win_card,
		last_win_cards: gameInfo.last_win_cards,
		next_deal_time: gameInfo.next_deal_time,
	};
	respSendActions.FireEventToTable(
		gameInfo._id.toString(),
		"ANDAR_BAHAR_WINNER_DECLARE",
		response
	);

	get_admin_game_info(gameInfo);

	let winnerDone = await this.add_winning_amount(gameInfo);
	csl("check_winner winnerDone : ", winnerDone);

	gameInfo["winner_users"] = winnerDone;

	await this.game_tracks(gameInfo);

	await finish_round(gameInfo);

	get_admin_game_info(gameInfo);
};
module.exports.add_winning_amount = async gameInfo => {
	csl("add_winning_amount gameInfo : ", gameInfo);

	if (Object.keys(gameInfo.bet_users_cards).length == 0) return [];

	let winner_users = [];

	let cards = gameInfo.win_card.split("-");
	let win_array = [cards[0].toString()];
	win_array.push(cards[1].toString());

	if (cards[0].toString() == "c" || cards[0].toString() == "l")
		win_array.push("cl");
	if (cards[0].toString() == "k" || cards[0].toString() == "fl")
		win_array.push("fk");

	if (Number(cards[1]) >= 1 || Number(cards[1]) <= 6) win_array.push("A_To_6");
	if (Number(cards[1]) >= 8 || Number(cards[1]) <= 13)
		win_array.push("8_To_13");

	win_array.push(gameInfo.win_info.last_card_throw);
	csl("add_winning_amount win_array : ", win_array);

	let bet_users_ticktes = gameInfo.bet_users_cards;
	csl("add_winning_amount bet_users_ticktes : ", bet_users_ticktes);

	let commission_rate =
		typeof gameInfo.game_config != "undefined" &&
		typeof gameInfo.game_config.COMMISSION != "undefined"
			? gameInfo.game_config.COMMISSION
			: 2;
	csl("add_winning_amount commission_rate : ", commission_rate);

	let x_reward =
		typeof gameInfo.game_config != "undefined" &&
		typeof gameInfo.game_config.REWARD_X != "undefined"
			? gameInfo.game_config.REWARD_X
			: 0;
	let n_reward =
		typeof gameInfo.game_config != "undefined" &&
		typeof gameInfo.game_config.REWARD_NORMAL != "undefined"
			? gameInfo.game_config.REWARD_NORMAL
			: 9;
	csl("add_winning_amount x_reward, n_reward : ", x_reward, n_reward);

	let total_win_prize = 0;

	for (let user_id_keys in bet_users_ticktes) {
		let ticket_ids = bet_users_ticktes[user_id_keys];
		csl("add_winning_amount ticket_ids: ", ticket_ids);

		if (ticket_ids.length != 0) {
			let total_win = 0;
			let total_bet = 0;
			let win_cards = [];

			let wh = {
				_id: MongoID(user_id_keys.toString()),
			};
			let project = {
				cards_16_config: 1,
			};
			let userInfo = await GameUser.findOne(wh, project).lean();
			csl("add_winning_amount userInfo : ", userInfo);

			let commission_rate =
				typeof userInfo.cards_16_config != "undefined" &&
				typeof userInfo.cards_16_config.commission != "undefined"
					? userInfo.cards_16_config.commission
					: 3.5;
			csl("add_winning_amount commission_rate : ", commission_rate);

			for (let key = 0; key < ticket_ids.length; key++) {
				let tickets_wh = {
					ticket_id: ticket_ids[key],
					status: 0,
				};
				csl("add_winning_amount tickets_wh : ", tickets_wh);

				let gameBetInfo = await Lucky16CardTracks.findOne(
					tickets_wh,
					{}
				).lean();
				csl("add_winning_amount gameBetInfo :", gameBetInfo);

				if (gameBetInfo != null) {
					let card_details = gameBetInfo.card_details;

					let total_win_amount = 0;
					let total_bet_amount = gameBetInfo.total_bet_amount;

					for (let keys in card_details) {
						csl("add_winning_amount  bet : ", card_details[keys]);

						if (win_array.indexOf(keys) != -1) {
							win_cards.push(keys);
							let bet_value = Number(card_details[keys]);
							let win_amount = 0;

							n_reward = 12;

							if (keys == "A_To_6" || keys == "8_To_K") {
								n_reward = 2;
							} else if (keys == "cl" || keys == "fk") {
								n_reward = 1.95;
							} else if (
								keys == "c" ||
								keys == "f" ||
								keys == "l" ||
								keys == "k"
							) {
								n_reward = 3.75;
							} else if (keys == "Under" || keys == "Bahar") {
								n_reward = 2;
							}
							win_amount = Number(bet_value) * n_reward;

							if (x_reward != 0) win_amount = win_amount * x_reward;

							total_win_amount = total_win_amount + win_amount;
						}
					}
					csl("add_winning_amount  total_win_amount : ", total_win_amount);
					total_bet = total_bet + total_bet_amount;

					if (total_win_amount > 0) {
						total_win_prize = total_win_prize + total_win_amount;
						total_win = total_win + total_win_amount;
						let uwh = {
							_id: MongoID(gameBetInfo.user_id),
						};
						let uProject = {
							cards_16_config: 1,
						};
						csl("place_bet uwh, uProject : ", uwh, uProject);

						let userInfo = await GameUser.findOne(uwh, uProject).lean();
						csl("place_bet userInfo : ", userInfo);

						let response = {
							win_card: win_cards,
							win_amount: total_win_amount,
							user_id: gameBetInfo.user_id,
						};
						let wh = {
							_id: gameInfo._id,
						};
						let updateData = {
							$inc: {
								winners: 1,
								total_bet_amount: -total_win_amount,
							},
							$push: {
								winner_users: gameBetInfo.ticket_id,
							},
						};
						csl("check_winner wh , project 1: ", wh, updateData);

						let gameInfo1 = await AndarBahars.findOneAndUpdate(wh, updateData, {
							new: true,
						});
						csl("check_winner gameInfo1 : ", gameInfo1);

						winner_users.push(response);

						let auto_claim = false;

						/* 
                            0 = blank
                            1 = cancelled
                            2 = not_claim
                            3 = claim 
                            4 = loss
                        */

						let status = auto_claim ? 3 : 2;

						let commision_amount = await win_tracks(
							total_bet_amount,
							total_win_amount,
							commission_rate,
							{ _id: gameBetInfo.user_id }
						);
						csl("check_winner commision_amount : ", commision_amount);

						let wh16 = {
							user_id: gameBetInfo.user_id,
							ticket_id: gameBetInfo.ticket_id,
						};
						let updateData16 = {
							$set: {
								x_reward_amount: x_reward,
								commission_amount: commision_amount,
								total_win_amount: total_win_amount,
								status: status,
								result_card: gameInfo.win_card,
								draw_time: new Date(),
							},
						};

						let gameTrackInfo = await Lucky16CardTracks.findOneAndUpdate(
							wh16,
							updateData16,
							{ new: true }
						);
						csl("check_winner gameTrackInfo : ", gameTrackInfo);

						// if(auto_claim){

						//     await claim_tracks(total_win_amount, {_id : gameBetInfo.user_id});
						//     await addWallet(gameBetInfo.user_id, total_win_amount, 2, "Single Chance winner", gameInfo1);

						// }else{

						await unclaim_tracks(total_win_amount, {
							_id: gameBetInfo.user_id,
						});

						// }

						response["total_bet_amount"] = total_bet_amount;
						response["ticket_id"] = gameBetInfo.ticket_id;

						// respSendActions.SendDataToUidDirect( gameBetInfo.user_id.toString() , 'LUCKY_CARD_WIN', response);
					} else {
						/* 
                            0 = blank
                            1 = cancelled
                            2 = auto-claim
                            3 = claim 
                            4 = loss
                        */
						let commision_amount = await loss_tracks(
							total_bet_amount,
							0,
							commission_rate,
							{
								_id: gameBetInfo.user_id,
							}
						);
						csl("check_winner commision_amount : ", commision_amount);

						let wh16 = {
							user_id: gameBetInfo.user_id,
							ticket_id: gameBetInfo.ticket_id,
						};
						let updateData16 = {
							$set: {
								x_reward_amount: x_reward,
								commission_amount: commision_amount,
								status: 4,
								result_card: gameInfo.win_card,
								draw_time: new Date(),
							},
						};
						let gameTrackInfo = await Lucky16CardTracks.findOneAndUpdate(
							wh16,
							updateData16,
							{ new: true }
						);
						csl("check_winner gameTrackInfo : ", gameTrackInfo);

						// let response = {
						//     ticket_id : gameBetInfo.ticket_id,
						//     win_card : [],
						//     win_amount : 0,
						//     total_bet_amount : total_bet_amount,
						//     user_id : gameBetInfo.user_id
						// }
						// respSendActions.SendDataToUidDirect( gameBetInfo.user_id , 'LUCKY_CARD_LOSE', response);
					}
				}
			}

			csl("add_winning_amount  total_win, total_bet : ", total_win, total_bet);
			let response = {
				ticket_id: ticket_ids,
				win_card: win_cards,
				win_amount: total_win,
				total_bet_amount: total_bet,
				user_id: user_id_keys,
				take: false,
			};

			let en = "ANDAR_BAHAR_WIN";
			if (total_win == 0) {
				en = "ANDAR_BAHAR_LOSE";
			} else {
				response.take = true;
			}

			respSendActions.SendDataToUidDirect(user_id_keys, en, response);
		}
	}
	if (Object.keys(bet_users_ticktes).length > 0) {
		await AdminCommissionTracks.update(
			{
				game_id: gameInfo.game_id,
				game_type: gameInfo.game_type,
			},
			{
				$set: {
					total_win_amount: total_win_prize,
				},
			}
		);
	}
	return winner_users;
};
module.exports.game_tracks = async gameInfo => {
	let trackInfo = Object.assign({}, gameInfo._doc);
	delete trackInfo._id;

	csl("game_tracks trackInfo :", trackInfo);
	await LuckyCardPlayTracks.create(trackInfo);

	return true;
};
