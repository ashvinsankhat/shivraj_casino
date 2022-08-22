module.exports.get_game_info = async (requestData, client) => {
	try {
		if (typeof client._id == "undefined") {
			respSendActions.SendDataToDirect(
				client.sck_id,
				"LUCKY_CARD_GAME_INFO",
				requestData,
				true,
				"1000",
				"User session not set, please restart game!",
				"Error!"
			);
			return true;
		}

		let wh = {};
		let project = {};
		let gameInfo = await LuckyCardPlayings.findOne(wh, project).lean();
		csl("get_game_info userInfos : ", gameInfo);

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
			cards_16_config: 1,
		};
		csl("get_game_info uwh, uProject : ", uwh, uProject);

		let userInfo = await GameUser.findOne(uwh, uProject).lean();
		csl("get_game_info userInfo : ", userInfo);

		let uChips = Number(userInfo.chips) + Number(userInfo.game_winning);
		csl("get_game_info  uChips, bet_value : ", uChips);

		let auto_claim =
			typeof userInfo.cards_16_config != "undefined" &&
			typeof userInfo.cards_16_config.auto_claim != "undefined" &&
			userInfo.cards_16_config.auto_claim
				? true
				: false;

		await redisClass.hset(
			"session:" + client.sck_id,
			"table_id",
			gameInfo._id.toString()
		);

		let init_timer =
			typeof gameInfo.game_config != "undefined" &&
			typeof gameInfo.game_config.NEXT_GAME_TIME != "undefined"
				? gameInfo.game_config.NEXT_GAME_TIME
				: 5;
		csl("get_game_info init_timer : ", init_timer);

		let game_timer =
			typeof gameInfo.game_config != "undefined" &&
			typeof gameInfo.game_config.DRAW_TIME != "undefined"
				? gameInfo.game_config.DRAW_TIME
				: 60;
		csl("get_game_info game_timer : ", game_timer);

		let spin_timer =
			typeof gameInfo.game_config != "undefined" &&
			typeof gameInfo.game_config.SPIN_TIME != "undefined"
				? gameInfo.game_config.SPIN_TIME
				: 5;
		csl("get_game_info spin_timer : ", spin_timer);

		let timer = 0;
		if (
			gameInfo.game_state == "init_game" ||
			gameInfo.game_state == "finish_state"
		) {
			timer =
				init_timer -
				(await commonClass.getTimeDifference(
					new Date(gameInfo.game_time.init_time),
					new Date(),
					"second"
				));
		} else if (gameInfo.game_state == "game_timer_start") {
			timer =
				game_timer -
				(await commonClass.getTimeDifference(
					new Date(gameInfo.game_time.gst_time),
					new Date(),
					"second"
				));
		} else if (gameInfo.game_state == "start_spin") {
			timer =
				spin_timer -
				(await commonClass.getTimeDifference(
					new Date(gameInfo.game_time.spin_time),
					new Date(),
					"second"
				));
		}
		let bet_value = 0;

		let wh1 = {
			user_id: MongoID(client._id),
			game_type: "lucky_cards_16",
			status: 2,
		};
		let project1 = {
			game_id: 1,
			total_bet_amount: 1,
			total_win_amount: 1,
			status: 1,
		};
		csl("get_game_info wh, project :", wh1, project1);

		let gameBetInfo = await Lucky16CardTracks.findOne(wh1, project1)
			.sort({ _id: -1 })
			.lean();
		csl("get_game_info gameBetInfo :", gameBetInfo);
		gameInfo.total_bet = bet_value;
		gameInfo.win = 0;

		gameInfo.take = false;

		if (gameBetInfo != null) {
			gameInfo.take = true;
			gameInfo.total_bet = gameBetInfo.total_bet_amount;
			gameInfo.win = gameBetInfo.total_win_amount;
		}
		delete gameInfo.game_config.COMMISSION;

		const lastCards = gameInfo.last_win_cards.slice(-10);
		csl("check_winner lastCards : ", lastCards);
		gameInfo.last_win_cards = lastCards;

		gameInfo.auto_claim = auto_claim;
		gameInfo.timer = timer;
		gameInfo.total_wallet = uChips;
		gameInfo.win = 0;

		gameInfo.bet_config = {
			min: {
				in: 5,
				out: 10,
			},
			max: {
				in: 10000,
				out: 50000,
			},
		};

		await this.joinTableRoom(gameInfo._id.toString(), client.sck_id);
		respSendActions.SendDataToUser(client, "LUCKY_CARD_GAME_INFO", gameInfo);
	} catch (e) {
		console.log("Exception get_game_info : ", e);
	}
};
module.exports.close_game = async (requestData, client) => {
	try {
		await this.leaveTableRoom(client.table_id.toString(), client.sck_id);

		await redisClass.hdel("session:" + client.sck_id, "table_id");

		respSendActions.SendDataToUser(client, "LUCKY_CARD_CLOSE_GAME", {
			done: true,
		});
	} catch (e) {
		console.log("Exception get_game_info : ", e);
	}
};
module.exports.auto_on_off = async (requestData, client) => {
	try {
		if (typeof client._id == "undefined") {
			respSendActions.SendDataToDirect(
				client.sck_id,
				"LUCKY_CARD_PLACE_BET",
				requestData,
				true,
				"1000",
				"User session not set, please restart game!",
				"Error!"
			);
			return true;
		}

		let auto_claim =
			typeof requestData.auto_claim != "undefined" && requestData.auto_claim
				? true
				: false;

		let wh = {
			_id: client._id,
		};
		let updateData = {
			$set: {
				"cards_16_config.auto_claim": auto_claim,
			},
		};
		csl("auto_on_off wh, updateData ::", wh, updateData);

		let userInfo = await GameUser.findOneAndUpdate(wh, updateData, {
			new: true,
		});
		csl("auto_on_off userInfo ::", userInfo);

		respSendActions.SendDataToUser(client, "LUCKY_CARD_16_AUTO_ON_OFF", {
			auto_claim: auto_claim,
		});
	} catch (e) {
		console.log("Exception get_game_info : ", e);
	}
};
module.exports.get_specific_game_info = async (requestData, client) => {
	try {
		if (typeof client._id == "undefined") {
			respSendActions.SendDataToDirect(
				client.sck_id,
				"LUCKY_CARD_16_GAME_SPECIFIC_INFO",
				requestData,
				true,
				"1000",
				"User session not set, please restart game!",
				"Error!"
			);
			return true;
		}
		let wh = {
			_id: requestData.g_id,
		};
		csl("get_specific_game_info wh :", wh);
		let project = {
			game_id: 1,
			ticket_id: 1,
			total_bet_amount: 1,
			total_win_amount: 1,
			draw_time: 1,
			status: 1,
			card_details: 1,
			createdAt: 1,
		};
		let gameBetInfo = await Lucky16CardTracks.findOne(wh, project).lean();
		csl("get_specific_game_info gameBetInfo :", gameBetInfo);

		respSendActions.SendDataToUser(
			client,
			"LUCKY_CARD_16_GAME_SPECIFIC_INFO",
			gameBetInfo
		);
		return false;
	} catch (e) {
		console.log("Exception get_specific_game_info : ", e);
	}
};
module.exports.joinTableRoom = async (table_id, sck_id) => {
	csl("Join Table room : ", table_id, sck_id);
	playExchange.publish("globle.123", {
		en: "JOIN_ROOM",
		data: {
			table_id: table_id,
			sck_id: sck_id,
		},
	});
};
module.exports.leaveTableRoom = async (table_id, sck_id) => {
	playExchange.publish("globle.123", {
		en: "LEAVE_ROOM",
		data: {
			table_id: table_id,
			sck_id: sck_id,
		},
	});
	return false;
};
