const { deductWallet } = require("./wallet_update");
const { play_tracks } = require("./report_track");

const { customAlphabet } = require("nanoid");
const { adminCommissionTrack } = require("../admin_track");
const nanoid = customAlphabet("1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

module.exports.place_bet = async (requestData, client) => {
	try {
		if (typeof client._id == "undefined") {
			respSendActions.SendDataToDirect(
				client.sck_id,
				"ROULETTE_PLACE_BET",
				requestData,
				true,
				"1000",
				"User session not set, please restart game!",
				"Error!"
			);
			return true;
		}
		if (
			typeof requestData.card_details == "undefined" ||
			(typeof requestData.card_details != "undefined" &&
				(requestData.card_details == null ||
					requestData.card_details.length == 0))
		) {
			respSendActions.SendDataToDirect(
				client.sck_id,
				"ROULETTE_PLACE_BET",
				requestData,
				true,
				"1026",
				"Please select card!",
				"Error!"
			);
			return true;
		}
		if (typeof client.place_bet != "undefined" && client.place_bet) {
			console.log("Please wait some time....!");
			return false;
		}
		client.place_bet = true;

		let gameInfos = await RoulettePlayings.findOne({}, {}).lean();
		csl("place_bet userInfos : ", gameInfos);

		if (gameInfos.game_state != "game_timer_start") {
			delete client.place_bet;
			respSendActions.SendDataToDirect(
				client.sck_id,
				"ROULETTE_PLACE_BET",
				requestData,
				true,
				"1033",
				"Please wait while round start!",
				"Error!"
			);
			return false;
		}

		let game_timer =
			typeof gameInfos.game_config != "undefined" &&
			typeof gameInfos.game_config.DRAW_TIME != "undefined"
				? gameInfos.game_config.DRAW_TIME
				: 60;
		csl("place_bet game_timer : ", game_timer);

		if (gameInfos.game_state == "game_timer_start") {
			timer =
				game_timer -
				(await commonClass.getTimeDifference(
					new Date(gameInfos.game_time.gst_time),
					new Date(),
					"second"
				));
			csl("place_bet timer : ", timer);
			if (timer < 9) {
				delete client.place_bet;
				respSendActions.SendDataToDirect(
					client.sck_id,
					"ROULETTE_PLACE_BET",
					requestData,
					true,
					"1034",
					"Time is over!, Please bet Next Round!",
					"Error!"
				);
				return false;
			}
		}

		let uwh = {
			_id: MongoID(client._id),
		};
		let uProject = {
			id: 1,
			unique_id: 1,
			display_user_name: 1,
			profile_url: 1,
			chips: 1,
			game_winning: 1,
		};
		csl("place_bet uwh, uProject : ", uwh, uProject);

		let userInfo = await GameUser.findOne(uwh, uProject).lean();
		csl("place_bet userInfo : ", userInfo);
		let uChips = Number(userInfo.chips) + Number(userInfo.game_winning);
		csl("place_bet  uChips, bet_value : ", uChips);

		let card_details = requestData.card_details;
		csl("\nplace_bet  card_details : ", card_details);
		let incease_card_bet = {
			"total_bet_on_cards.00": 0,
			"total_bet_on_cards.0": 0,
			"total_bet_on_cards.1": 0,
			"total_bet_on_cards.2": 0,
			"total_bet_on_cards.3": 0,
			"total_bet_on_cards.4": 0,
			"total_bet_on_cards.5": 0,
			"total_bet_on_cards.6": 0,
			"total_bet_on_cards.7": 0,
			"total_bet_on_cards.8": 0,
			"total_bet_on_cards.9": 0,
			"total_bet_on_cards.10": 0,
			"total_bet_on_cards.11": 0,
			"total_bet_on_cards.12": 0,
			"total_bet_on_cards.13": 0,
			"total_bet_on_cards.14": 0,
			"total_bet_on_cards.15": 0,
			"total_bet_on_cards.16": 0,
			"total_bet_on_cards.17": 0,
			"total_bet_on_cards.18": 0,
			"total_bet_on_cards.19": 0,
			"total_bet_on_cards.20": 0,
			"total_bet_on_cards.21": 0,
			"total_bet_on_cards.22": 0,
			"total_bet_on_cards.23": 0,
			"total_bet_on_cards.24": 0,
			"total_bet_on_cards.25": 0,
			"total_bet_on_cards.26": 0,
			"total_bet_on_cards.27": 0,
			"total_bet_on_cards.28": 0,
			"total_bet_on_cards.29": 0,
			"total_bet_on_cards.30": 0,
			"total_bet_on_cards.31": 0,
			"total_bet_on_cards.32": 0,
			"total_bet_on_cards.33": 0,
			"total_bet_on_cards.34": 0,
			"total_bet_on_cards.35": 0,
			"total_bet_on_cards.36": 0,
		};

		let total_number = Object.keys(card_details).length;
		csl("\nplace_bet  total_number : ", total_number);

		let bet_value = 0;
		let number_wise_bet_value = 0;

		for (let keys in card_details) {
			if (keys == "1st_12" || keys == "2nd_12" || keys == "3rf_12") {
				let number_wise_bet_value = Number(
					(Number(card_details[keys]) / 12).toFixed(2)
				);
				bet_value = bet_value + Number(card_details[keys]);

				if (keys == "1st_12") {
					for (let i = 1; i <= 12; i++) {
						incease_card_bet["total_bet_on_cards." + i] =
							incease_card_bet["total_bet_on_cards." + i] +
							number_wise_bet_value;
					}
				} else if (keys == "2nd_12") {
					for (let i = 13; i <= 24; i++) {
						incease_card_bet["total_bet_on_cards." + i] =
							incease_card_bet["total_bet_on_cards." + i] +
							number_wise_bet_value;
					}
				} else if (keys == "3rf_12") {
					for (let i = 25; i <= 36; i++) {
						incease_card_bet["total_bet_on_cards." + i] =
							incease_card_bet["total_bet_on_cards." + i] +
							number_wise_bet_value;
					}
				}
			} else if (keys == "1to18" || keys == "19to36") {
				let number_wise_bet_value = Number(
					(Number(card_details[keys]) / 18).toFixed(2)
				);
				bet_value = bet_value + Number(card_details[keys]);

				if (keys == "1to18") {
					for (let i = 1; i <= 18; i++) {
						incease_card_bet["total_bet_on_cards." + i] =
							incease_card_bet["total_bet_on_cards." + i] +
							number_wise_bet_value;
					}
				} else if (keys == "19to36") {
					for (let i = 19; i <= 36; i++) {
						incease_card_bet["total_bet_on_cards." + i] =
							incease_card_bet["total_bet_on_cards." + i] +
							number_wise_bet_value;
					}
				}
			} else if (
				keys == "Even" ||
				keys == "ODD" ||
				keys == "Red_Chokadi" ||
				keys == "Black_Chokadi"
			) {
				let number_wise_bet_value = Number(
					(Number(card_details[keys]) / 18).toFixed(2)
				);
				bet_value = bet_value + Number(card_details[keys]);

				if (keys == "Even") {
					let even_number = [
						2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36,
					];

					for (let i = 0; i <= even_number.length - 1; i++) {
						let number = even_number[i];
						incease_card_bet["total_bet_on_cards." + number] =
							incease_card_bet["total_bet_on_cards." + number] +
							number_wise_bet_value;
					}
				} else if (keys == "ODD") {
					let odd_number = [
						1, 3, 5, 7, 9, 11, 13, 15, 18, 19, 21, 23, 25, 27, 29, 31, 33, 35,
					];
					for (let i = 0; i <= odd_number.length - 1; i++) {
						let number = odd_number[i];
						incease_card_bet["total_bet_on_cards." + number] =
							incease_card_bet["total_bet_on_cards." + number] +
							number_wise_bet_value;
					}
				} else if (keys == "Red_Chokadi") {
					let red_number = [
						1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
					];
					for (let i = 0; i <= red_number.length - 1; i++) {
						let number = red_number[i];
						incease_card_bet["total_bet_on_cards." + number] =
							incease_card_bet["total_bet_on_cards." + number] +
							number_wise_bet_value;
					}
				} else if (keys == "Black_Chokadi") {
					let black_number = [
						2, 4, 8, 6, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
					];
					for (let i = 0; i <= black_number.length - 1; i++) {
						let number = black_number[i];
						incease_card_bet["total_bet_on_cards." + number] =
							incease_card_bet["total_bet_on_cards." + number] +
							number_wise_bet_value;
					}
				}
			} else if (
				keys == "2To1_FirstRow" ||
				keys == "2To1_SecondRow" ||
				keys == "2To1_ThirdRow"
			) {
				let number_wise_bet_value = Number(
					(Number(card_details[keys]) / 12).toFixed(2)
				);
				bet_value = bet_value + Number(card_details[keys]);

				if (keys == "2To1_FirstRow") {
					let frow_number = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
					for (let i = 0; i <= frow_number.length - 1; i++) {
						let number = frow_number[i];
						incease_card_bet["total_bet_on_cards." + number] =
							incease_card_bet["total_bet_on_cards." + number] +
							number_wise_bet_value;
					}
				} else if (keys == "2To1_SecondRow") {
					let frow_number = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
					for (let i = 0; i <= frow_number.length - 1; i++) {
						let number = frow_number[i];
						incease_card_bet["total_bet_on_cards." + number] =
							incease_card_bet["total_bet_on_cards." + number] +
							number_wise_bet_value;
					}
				} else if (keys == "2To1_ThirdRow") {
					let trow_number = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
					for (let i = 0; i <= trow_number.length - 1; i++) {
						let number = trow_number[i];
						incease_card_bet["total_bet_on_cards." + number] =
							incease_card_bet["total_bet_on_cards." + number] +
							number_wise_bet_value;
					}
				}
			} else {
				let specific_number = keys.split("-");

				let number_wise_bet_value = Number(
					(Number(card_details[keys]) / specific_number.length).toFixed(2)
				);
				bet_value = bet_value + Number(card_details[keys]);

				for (let i = 0; i <= specific_number.length - 1; i++) {
					let number = specific_number[i];
					incease_card_bet["total_bet_on_cards." + number] =
						incease_card_bet["total_bet_on_cards." + number] +
						number_wise_bet_value;
				}
			}
		}
		for (let keys_type in incease_card_bet) {
			if (incease_card_bet[keys_type] == 0) {
				delete incease_card_bet[keys_type];
			}
		}
		csl("\nplace_bet  bet_value : ", number_wise_bet_value);

		if (uChips < bet_value || bet_value <= 0) {
			delete client.place_bet;
			respSendActions.SendDataToDirect(
				client.sck_id,
				"ROULETTE_PLACE_BET",
				requestData,
				true,
				"1032",
				"Insufficient wallet, Please add Cash In Game!",
				"Error!"
			);
			return false;
		}

		let ticketId = nanoid();
		csl("place_bet ticketId : ", ticketId);

		let net_bet_value = await adminCommissionTrack(gameInfos, bet_value);
		csl("\nrepeat_bet net_bet_value : ", net_bet_value);

		incease_card_bet["total_bet_amount"] = net_bet_value;
		incease_card_bet["user_total_bet_amount"] = net_bet_value;

		let bet_info = {
			user_id: client._id,
			card_details: card_details,
			ticket_id: ticketId,
		};

		let updateData = {
			$push: {},
			$inc: incease_card_bet,
		};
		updateData["$push"]["bet_users_cards." + client._id] = ticketId;
		csl("place_bet updateData : ", updateData);

		let gameInfo = await RoulettePlayings.findOneAndUpdate({}, updateData, {
			new: true,
		});
		csl("place_bet userInfos : ", gameInfo);

		await play_tracks(bet_value, client);

		bet_info["game_id"] = gameInfo.game_id;
		bet_info["total_bet_amount"] = bet_value;
		bet_info["game_type"] = "roulette";
		csl("place_bet bet_info : ", bet_info);

		let wallet_update = await deductWallet(
			userInfo._id.toString(),
			-bet_value,
			1,
			"Roulette bet",
			gameInfo
		);

		let betIn = await Lucky16CardTracks.create(bet_info);
		csl("place_bet betIn : ", betIn);

		respSendActions.SendDataToDirect(
			client.sck_id,
			"ROULETTE_PLACE_BET",
			betIn
		);
		delete client.place_bet;

		let room = "Admin_" + gameInfo._id.toString();
		respSendActions.FireEventToTable(
			room,
			"ADMIN_ROULETTE_GAME_INFO",
			gameInfo
		);

		return true;
	} catch (e) {
		console.log("Exception place_bet : ", e);
	}
};
module.exports.repeat_bet = async (requestData, client) => {
	try {
		if (typeof client._id == "undefined") {
			respSendActions.SendDataToDirect(
				client.sck_id,
				"ROULETTE_REPEAT_BET",
				requestData,
				true,
				"1000",
				"User session not set, please restart game!",
				"Error!"
			);
			return true;
		}
		if (typeof client.repeat_bet != "undefined" && client.repeat_bet) {
			console.log("Please wait some time....!");
			return false;
		}
		client.repeat_bet = true;

		let gameInfos = await RoulettePlayings.findOne({}, {}).lean();
		csl("repeat_bet userInfos : ", gameInfos);

		if (gameInfos.game_state != "game_timer_start") {
			delete client.repeat_bet;
			respSendActions.SendDataToDirect(
				client.sck_id,
				"ROULETTE_REPEAT_BET",
				requestData,
				true,
				"1033",
				"Please wait while round start!",
				"Error!"
			);
			return false;
		}

		let game_timer =
			typeof gameInfos.game_config != "undefined" &&
			typeof gameInfos.game_config.DRAW_TIME != "undefined"
				? gameInfos.game_config.DRAW_TIME
				: 60;
		csl("repeat_bet game_timer : ", game_timer);

		if (gameInfos.game_state == "game_timer_start") {
			timer =
				game_timer -
				(await commonClass.getTimeDifference(
					new Date(gameInfos.game_time.gst_time),
					new Date(),
					"second"
				));

			if (timer < 9) {
				delete client.repeat_bet;
				respSendActions.SendDataToDirect(
					client.sck_id,
					"ROULETTE_REPEAT_BET",
					requestData,
					true,
					"1034",
					"Time is over!, Please bet Next Round!",
					"Error!"
				);
				return false;
			}
		}

		let uwh = {
			_id: MongoID(client._id),
		};
		let uProject = {
			id: 1,
			unique_id: 1,
			display_user_name: 1,
			profile_url: 1,
			chips: 1,
			game_winning: 1,
		};
		csl("repeat_bet uwh, uProject : ", uwh, uProject);

		let userInfo = await GameUser.findOne(uwh, uProject).lean();
		csl("repeat_bet userInfo : ", userInfo);

		let wh = {
			user_id: client._id,
			game_type: "roulette",
		};
		let project = {};
		let lastBetInfo = await LuckyCardBets.findOne(wh, project).sort({
			_id: -1,
		});
		csl("repeat_bet lastBetInfo : ", lastBetInfo);

		if (lastBetInfo == null) {
			delete client.repeat_bet;
			respSendActions.SendDataToDirect(
				client.sck_id,
				"ROULETTE_REPEAT_BET",
				requestData,
				true,
				"1033",
				"No any Last Bet!",
				"Error!"
			);
			return true;
		}

		let uChips = Number(userInfo.chips) + Number(userInfo.game_winning);
		csl("repeat_bet  uChips, bet_value : ", uChips);

		let bet_value = 0;

		let card_details = lastBetInfo.card_details;
		csl("\nplace_bet  card_details : ", card_details);
		let incease_card_bet = {
			"total_bet_on_cards.00": 0,
			"total_bet_on_cards.0": 0,
			"total_bet_on_cards.1": 0,
			"total_bet_on_cards.2": 0,
			"total_bet_on_cards.3": 0,
			"total_bet_on_cards.4": 0,
			"total_bet_on_cards.5": 0,
			"total_bet_on_cards.6": 0,
			"total_bet_on_cards.7": 0,
			"total_bet_on_cards.8": 0,
			"total_bet_on_cards.9": 0,
			"total_bet_on_cards.10": 0,
			"total_bet_on_cards.11": 0,
			"total_bet_on_cards.12": 0,
			"total_bet_on_cards.13": 0,
			"total_bet_on_cards.14": 0,
			"total_bet_on_cards.15": 0,
			"total_bet_on_cards.16": 0,
			"total_bet_on_cards.17": 0,
			"total_bet_on_cards.18": 0,
			"total_bet_on_cards.19": 0,
			"total_bet_on_cards.20": 0,
			"total_bet_on_cards.21": 0,
			"total_bet_on_cards.22": 0,
			"total_bet_on_cards.23": 0,
			"total_bet_on_cards.24": 0,
			"total_bet_on_cards.25": 0,
			"total_bet_on_cards.26": 0,
			"total_bet_on_cards.27": 0,
			"total_bet_on_cards.28": 0,
			"total_bet_on_cards.29": 0,
			"total_bet_on_cards.30": 0,
			"total_bet_on_cards.31": 0,
			"total_bet_on_cards.32": 0,
			"total_bet_on_cards.33": 0,
			"total_bet_on_cards.34": 0,
			"total_bet_on_cards.35": 0,
			"total_bet_on_cards.36": 0,
		};
		for (let keys in card_details) {
			if (keys == "1st_12" || keys == "2nd_12" || keys == "3rf_12") {
				let number_wise_bet_value = Number(
					(Number(card_details[keys]) / 12).toFixed(2)
				);
				bet_value = bet_value + Number(card_details[keys]);

				if (keys == "1st_12") {
					for (let i = 1; i <= 12; i++) {
						incease_card_bet["total_bet_on_cards." + i] =
							incease_card_bet["total_bet_on_cards." + i] +
							number_wise_bet_value;
					}
				} else if (keys == "2nd_12") {
					for (let i = 13; i <= 24; i++) {
						incease_card_bet["total_bet_on_cards." + i] =
							incease_card_bet["total_bet_on_cards." + i] +
							number_wise_bet_value;
					}
				} else if (keys == "3rf_12") {
					for (let i = 25; i <= 36; i++) {
						incease_card_bet["total_bet_on_cards." + i] =
							incease_card_bet["total_bet_on_cards." + i] +
							number_wise_bet_value;
					}
				}
			} else if (keys == "1to18" || keys == "19to36") {
				let number_wise_bet_value = Number(
					(Number(card_details[keys]) / 18).toFixed(2)
				);
				bet_value = bet_value + Number(card_details[keys]);
				card_details[keys] = number_wise_bet_value;

				if (keys == "1to18") {
					for (let i = 1; i <= 18; i++) {
						incease_card_bet["total_bet_on_cards." + i] =
							incease_card_bet["total_bet_on_cards." + i] +
							number_wise_bet_value;
					}
				} else if (keys == "19to36") {
					for (let i = 19; i <= 36; i++) {
						incease_card_bet["total_bet_on_cards." + i] =
							incease_card_bet["total_bet_on_cards." + i] +
							number_wise_bet_value;
					}
				}
			} else if (
				keys == "Even" ||
				keys == "ODD" ||
				keys == "Red_Chokadi" ||
				keys == "Black_Chokadi"
			) {
				let number_wise_bet_value = Number(
					(Number(card_details[keys]) / 18).toFixed(2)
				);
				bet_value = bet_value + Number(card_details[keys]);
				card_details[keys] = number_wise_bet_value;

				if (keys == "Even") {
					let even_number = [
						2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36,
					];

					for (let i = 0; i <= even_number.length - 1; i++) {
						let number = even_number[i];
						incease_card_bet["total_bet_on_cards." + number] =
							incease_card_bet["total_bet_on_cards." + number] +
							number_wise_bet_value;
					}
				} else if (keys == "ODD") {
					let odd_number = [
						1, 3, 5, 7, 9, 11, 13, 15, 18, 19, 21, 23, 25, 27, 29, 31, 33, 35,
					];
					for (let i = 0; i <= odd_number.length - 1; i++) {
						let number = odd_number[i];
						incease_card_bet["total_bet_on_cards." + number] =
							incease_card_bet["total_bet_on_cards." + number] +
							number_wise_bet_value;
					}
				} else if (keys == "Red_Chokadi") {
					let red_number = [
						1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
					];
					for (let i = 0; i <= red_number.length - 1; i++) {
						let number = red_number[i];
						incease_card_bet["total_bet_on_cards." + number] =
							incease_card_bet["total_bet_on_cards." + number] +
							number_wise_bet_value;
					}
				} else if (keys == "Black_Chokadi") {
					let black_number = [
						2, 4, 8, 6, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
					];
					for (let i = 0; i <= black_number.length - 1; i++) {
						let number = black_number[i];
						incease_card_bet["total_bet_on_cards." + number] =
							incease_card_bet["total_bet_on_cards." + number] +
							number_wise_bet_value;
					}
				}
			} else if (
				keys == "2To1_FirstRow" ||
				keys == "2To1_SecondRow" ||
				keys == "2To1_ThirdRow"
			) {
				let number_wise_bet_value = Number(
					(Number(card_details[keys]) / 12).toFixed(2)
				);
				bet_value = bet_value + Number(card_details[keys]);
				card_details[keys] = number_wise_bet_value;

				if (keys == "2To1_FirstRow") {
					let frow_number = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
					for (let i = 0; i <= frow_number.length - 1; i++) {
						let number = frow_number[i];
						incease_card_bet["total_bet_on_cards." + number] =
							incease_card_bet["total_bet_on_cards." + number] +
							number_wise_bet_value;
					}
				} else if (keys == "2To1_SecondRow") {
					let frow_number = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
					for (let i = 0; i <= frow_number.length - 1; i++) {
						let number = frow_number[i];
						incease_card_bet["total_bet_on_cards." + number] =
							incease_card_bet["total_bet_on_cards." + number] +
							number_wise_bet_value;
					}
				} else if (keys == "2To1_ThirdRow") {
					let trow_number = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
					for (let i = 0; i <= trow_number.length - 1; i++) {
						let number = trow_number[i];
						incease_card_bet["total_bet_on_cards." + number] =
							incease_card_bet["total_bet_on_cards." + number] +
							number_wise_bet_value;
					}
				}
			} else {
				let specific_number = keys.split("-");

				let number_wise_bet_value = Number(
					(Number(card_details[keys]) / specific_number.length).toFixed(2)
				);
				bet_value = bet_value + Number(card_details[keys]);
				card_details[keys] = number_wise_bet_value;

				for (let i = 0; i <= specific_number.length - 1; i++) {
					let number = specific_number[i];
					incease_card_bet["total_bet_on_cards." + number] =
						incease_card_bet["total_bet_on_cards." + number] +
						number_wise_bet_value;
				}
			}
		}
		for (let keys_type in incease_card_bet) {
			if (incease_card_bet[keys_type] == 0) {
				delete incease_card_bet[keys_type];
			}
		}
		csl("\nplace_bet  bet_value : ", bet_value);

		if (uChips < bet_value || bet_value <= 0) {
			delete client.repeat_bet;
			respSendActions.SendDataToDirect(
				client.sck_id,
				"ROULETTE_REPEAT_BET",
				requestData,
				true,
				"1032",
				"Insufficient wallet, Please add Cash In Game!",
				"Error!"
			);
			return false;
		}
		let ticketId = nanoid();
		csl("repeat_bet ticketId : ", ticketId);

		let net_bet_value = await adminCommissionTrack(gameInfos, bet_value);
		csl("\nrepeat_bet net_bet_value : ", net_bet_value);

		incease_card_bet["total_bet_amount"] = net_bet_value;
		incease_card_bet["user_total_bet_amount"] = net_bet_value;

		let bet_info = {
			user_id: client._id,
			card_details: card_details,
			ticket_id: ticketId,
		};

		let updateData = {
			$push: {},
			$inc: incease_card_bet,
		};
		updateData["$push"]["bet_users_cards." + client._id] = ticketId;
		csl("place_bet updateData : ", updateData);

		let gameInfo = await RoulettePlayings.findOneAndUpdate({}, updateData, {
			new: true,
		});
		csl("repeat_bet userInfos : ", gameInfo);

		await play_tracks(bet_value, client);

		bet_info["game_id"] = gameInfo.game_id;
		bet_info["total_bet_amount"] = bet_value;
		bet_info["game_type"] = "roulette";
		csl("repeat_bet bet_info : ", bet_info);

		let wallet_update = await deductWallet(
			userInfo._id.toString(),
			-bet_value,
			1,
			"Roulette bet",
			gameInfo
		);

		let betIn = await Lucky16CardTracks.create(bet_info);
		csl("repeat_bet betIn : ", betIn);

		respSendActions.SendDataToDirect(
			client.sck_id,
			"ROULETTE_REPEAT_BET",
			betIn
		);
		delete client.repeat_bet;
		return true;
	} catch (e) {
		console.log("Exception repeat_bet : ", e);
	}
};
