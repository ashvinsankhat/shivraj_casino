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
				"LUCKY_SORAT_PLACE_BET",
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
				"LUCKY_SORAT_PLACE_BET",
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

		let gameInfos = await LuckySoratPlayings.findOne({}, {}).lean();
		csl("place_bet userInfos : ", gameInfos);

		if (gameInfos.game_state != "game_timer_start") {
			delete client.place_bet;
			respSendActions.SendDataToDirect(
				client.sck_id,
				"LUCKY_SORAT_PLACE_BET",
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

			if (timer < 9) {
				delete client.place_bet;
				respSendActions.SendDataToDirect(
					client.sck_id,
					"LUCKY_SORAT_PLACE_BET",
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

		let bet_value = 0;

		let card_details = requestData.card_details;
		csl("\nplace_bet  card_details : ", card_details);
		let incease_card_bet = {};
		for (let keys in card_details) {
			incease_card_bet["total_bet_on_cards." + keys] = Number(
				card_details[keys]
			);
			csl("place_bet  card_details : ", card_details[keys]);
			bet_value = bet_value + Number(card_details[keys]);
		}

		csl("\nplace_bet  bet_value : ", bet_value);

		if (uChips < bet_value || bet_value <= 0) {
			delete client.place_bet;
			respSendActions.SendDataToDirect(
				client.sck_id,
				"LUCKY_SORAT_PLACE_BET",
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

		let gameInfo = await LuckySoratPlayings.findOneAndUpdate({}, updateData, {
			new: true,
		});
		csl("place_bet userInfos : ", gameInfo);

		await play_tracks(bet_value, client);

		bet_info["game_id"] = gameInfo.game_id;
		bet_info["total_bet_amount"] = bet_value;
		bet_info["game_type"] = "lucky_sorat";
		csl("place_bet bet_info : ", bet_info);

		let wallet_update = await deductWallet(
			userInfo._id.toString(),
			-bet_value,
			1,
			"Lucky Sorat bet",
			gameInfo
		);

		let betIn = await Lucky16CardTracks.create(bet_info);
		csl("place_bet betIn : ", betIn);

		respSendActions.SendDataToDirect(
			client.sck_id,
			"LUCKY_SORAT_PLACE_BET",
			betIn
		);
		delete client.place_bet;

		let room = "Admin_" + gameInfo._id.toString();
		respSendActions.FireEventToTable(
			room,
			"ADMIN_LUCKY_SORAT_GAME_INFO",
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
				"LUCKY_SORAT_REPEAT_BET",
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

		let gameInfos = await LuckySoratPlayings.findOne({}, {}).lean();
		csl("place_bet userInfos : ", gameInfos);

		if (gameInfos.game_state != "game_timer_start") {
			delete client.repeat_bet;
			respSendActions.SendDataToDirect(
				client.sck_id,
				"LUCKY_SORAT_REPEAT_BET",
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

			if (timer < 9) {
				delete client.repeat_bet;
				respSendActions.SendDataToDirect(
					client.sck_id,
					"LUCKY_SORAT_REPEAT_BET",
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

		let wh = {};
		let project = {};
		let lastBetInfo = await LuckyCardBets.findOne(wh, project).sort({
			_id: -1,
		});
		csl("repeat_bet lastBetInfo : ", lastBetInfo);

		if (lastBetInfo == null) {
			delete client.repeat_bet;
			respSendActions.SendDataToDirect(
				client.sck_id,
				"LUCKY_SORAT_REPEAT_BET",
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

		let card_details = requestData.card_details;
		csl("\nplace_bet  card_details : ", card_details);
		let incease_card_bet = {};
		for (let keys in card_details) {
			incease_card_bet["total_bet_on_cards." + keys] = Number(
				card_details[keys]
			);
			csl("place_bet  card_details : ", card_details[keys]);
			bet_value = bet_value + Number(card_details[keys]);
		}

		csl("\nplace_bet  bet_value : ", bet_value);

		if (uChips < bet_value || bet_value <= 0) {
			delete client.repeat_bet;
			respSendActions.SendDataToDirect(
				client.sck_id,
				"LUCKY_SORAT_REPEAT_BET",
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

		let gameInfo = await LuckySoratPlayings.findOneAndUpdate({}, updateData, {
			new: true,
		});
		csl("repeat_bet userInfos : ", gameInfo);

		await play_tracks(bet_value, client);

		bet_info["game_id"] = gameInfo.game_id;
		bet_info["total_bet_amount"] = bet_value;

		bet_info["game_type"] = "lucky_sorat";
		csl("repeat_bet bet_info : ", bet_info);

		let wallet_update = await deductWallet(
			userInfo._id.toString(),
			-bet_value,
			1,
			"Lucky Sorat bet",
			gameInfo
		);

		let betIn = await Lucky16CardTracks.create(bet_info);
		csl("repeat_bet betIn : ", betIn);

		respSendActions.SendDataToDirect(
			client.sck_id,
			"LUCKY_SORAT_REPEAT_BET",
			betIn
		);
		delete client.repeat_bet;
		return true;
	} catch (e) {
		console.log("Exception repeat_bet : ", e);
	}
};
