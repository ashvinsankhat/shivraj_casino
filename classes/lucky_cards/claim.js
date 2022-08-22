const { addWallet } = require("./wallet_update");
const { win_tracks, claim_tracks, unclaim_tracks } = require("./report_track");

module.exports.claim = async (requestData, client) => {
	try {
		if (typeof client._id == "undefined") {
			respSendActions.SendDataToDirect(
				client.sck_id,
				"LUCKY_CARD_16_CLAIM",
				requestData,
				true,
				"1000",
				"User session not set, please restart game!",
				"Error!"
			);
			return true;
		}

		let rcKey = "Claim.lucky_cards_16:" + client._id.toString();
		let rcRadis = await redisClass.setnx(rcKey, 1, 30);
		if (rcRadis == 0) {
			csl("Lucky cards 16 please wait some time....!", rcRadis);
			return false;
		}

		let wh = {
			user_id: client._id,
			game_type: "lucky_cards_16",
			status: 2,
		};
		if (
			typeof requestData.g_id != "undefined" &&
			requestData.g_id != "" &&
			requestData.g_id.length == 24
		) {
			wh = {
				_id: requestData.g_id,
				game_type: "lucky_cards_16",
				status: 2,
			};
		}
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
		csl("get_game_list wh, project :", wh, project);

		let gameBetInfo = await Lucky16CardTracks.findOne(wh, project).lean();
		csl("claim gameBetInfo :", gameBetInfo);

		if (gameBetInfo == null) {
			redisClass.del(rcKey);
			respSendActions.SendDataToDirect(
				client.sck_id,
				"LUCKY_CARD_16_CLAIM",
				requestData,
				true,
				"1033",
				"No bet found!",
				"Error!"
			);
			return true;
		}
		let updateData16 = {
			$set: {
				status: 3,
			},
		};
		csl("claim wh, updateData16 : ", wh, updateData16);

		let ra_wh = {};
		let ra_project = {
			last_win_cards: 1,
		};
		let gameInfo = await LuckyCardPlayings.findOne(ra_wh, ra_project).lean();
		csl("claim userInfos : ", gameInfo);

		let gameTrackInfo = await Lucky16CardTracks.findOneAndUpdate(
			wh,
			updateData16,
			{ new: true }
		).lean();
		csl("claim gameTrackInfo : ", gameTrackInfo);

		await claim_tracks(gameTrackInfo.total_win_amount, {
			_id: gameTrackInfo.user_id,
		});
		await unclaim_tracks(-gameTrackInfo.total_win_amount, {
			_id: gameTrackInfo.user_id,
		});

		await addWallet(
			gameTrackInfo.user_id,
			gameTrackInfo.total_win_amount,
			2,
			"Lucky Card 16 One Claim",
			gameTrackInfo
		);

		if (
			!(
				typeof requestData.g_id != "undefined" &&
				requestData.g_id != "" &&
				requestData.g_id.length == 24
			)
		) {
			gameTrackInfo.in_game = true;
		} else {
			gameTrackInfo.in_game = false;
		}

		const lastCards = gameInfo.last_win_cards.slice(-10);
		csl("claim lastCards : ", lastCards);

		gameTrackInfo.take = false;
		gameTrackInfo.last_win_cards = lastCards;

		respSendActions.SendDataToUser(
			client,
			"LUCKY_CARD_16_CLAIM",
			gameTrackInfo
		);
		redisClass.del(rcKey);

		return false;
	} catch (e) {
		console.log("Exception claim : ", e);
	}
};
module.exports.all_claim = async (requestData, client) => {
	try {
		if (typeof client._id == "undefined") {
			respSendActions.SendDataToDirect(
				client.sck_id,
				"LUCKY_CARD_16_ALL_CLAIM",
				requestData,
				true,
				"1000",
				"User session not set, please restart game!",
				"Error!"
			);
			return true;
		}
		let rcKey = "Claim.lucky_cards_16:" + client._id.toString();
		let rcRadis = await redisClass.setnx(rcKey, 1, 30);
		if (rcRadis == 0) {
			csl("Lucky cards 16 please wait some time....!", rcRadis);
			return false;
		}

		let wh = {
			user_id: client._id,
			game_type: "lucky_cards_16",
			status: 2,
		};
		csl("claim wh :", wh);
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
		let gameBetInfo = await Lucky16CardTracks.find(wh, project).lean();
		csl("claim gameBetInfo :", gameBetInfo);

		if (gameBetInfo.length == 0) {
			redisClass.del(rcKey);
			respSendActions.SendDataToDirect(
				client.sck_id,
				"LUCKY_CARD_16_ALL_CLAIM",
				requestData,
				true,
				"1033",
				"No bet found!",
				"Error!"
			);
			return true;
		}
		for (let i = 0; i < gameBetInfo.length; i++) {
			let wh16 = {
				_id: gameBetInfo[i]._id,
			};
			let updateData16 = {
				$set: {
					status: 3,
				},
			};
			csl("claim wh16, updateData16 : ", wh16, updateData16);

			let gameTrackInfo = await Lucky16CardTracks.findOneAndUpdate(
				wh16,
				updateData16,
				{ new: true }
			);
			csl("claim gameTrackInfo : ", gameTrackInfo);

			await claim_tracks(gameTrackInfo.total_win_amount, {
				_id: gameTrackInfo.user_id,
			});
			await unclaim_tracks(-gameTrackInfo.total_win_amount, {
				_id: gameTrackInfo.user_id,
			});
			await addWallet(
				gameTrackInfo.user_id,
				gameTrackInfo.total_win_amount,
				3,
				"Lucky Card 16 Multi Claim",
				gameTrackInfo
			);
		}

		let response = {
			done: true,
		};
		respSendActions.SendDataToUser(client, "LUCKY_CARD_16_ALL_CLAIM", response);
		redisClass.del(rcKey);

		return false;
	} catch (e) {
		console.log("Exception all_claim : ", e);
	}
};
