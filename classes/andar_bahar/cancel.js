const { addWallet } = require("./wallet_update");
const { play_tracks } = require("./report_track");
const { adminCommissionTrackOnCancelBet } = require("../admin_track");

module.exports.cancel = async (requestData, client) => {
	try {
		if (typeof client._id == "undefined") {
			respSendActions.SendDataToDirect(
				client.sck_id,
				"ANDAR_BAHAR_CANCEL_BET",
				requestData,
				true,
				"1000",
				"User session not set, please restart game!",
				"Error!"
			);
			return true;
		}
		if (typeof client.cancel != "undefined" && client.cancel) {
			console.log("Cancel please wait some time....!");
			return false;
		}
		client.cancel = true;

		let gameInfos = await AndarBahars.findOne({}, {}).lean();
		csl("cancel gameInfos : ", gameInfos);

		let wh = {
			game_id: gameInfos.game_id,
			game_type: "andar_bahar",
			status: 0,
		};
		if (
			typeof requestData.g_id != "undefined" &&
			requestData.g_id != "" &&
			requestData.g_id.length == 24
		) {
			wh = {
				_id: requestData.g_id,
				game_type: "andar_bahar",
				status: 0,
			};
		}

		csl("cancel wh :", wh);
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
		csl("cancel gameBetInfo :", gameBetInfo);

		if (gameBetInfo == null) {
			delete client.cancel;
			respSendActions.SendDataToDirect(
				client.sck_id,
				"ANDAR_BAHAR_CANCEL_BET",
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
				status: 1,
			},
		};
		csl("cancel wh, updateData16 : ", wh, updateData16);

		let gameTrackInfo = await Lucky16CardTracks.findOneAndUpdate(
			wh,
			updateData16,
			{ new: true }
		).lean();
		csl("cancel gameTrackInfo ::", gameTrackInfo);

		let card_details = gameTrackInfo.card_details;
		csl("cancel  card_details : ", card_details);

		let incease_card_bet = {};
		let bet_value = 0;

		for (let keys in card_details) {
			incease_card_bet["total_bet_on_cards." + keys] = -Number(
				card_details[keys]
			);
			csl("place_bet  card_details : ", card_details[keys]);

			bet_value = bet_value + Number(card_details[keys]);
		}
		csl("cancel  bet_value : ", bet_value, incease_card_bet);
		let net_net_value = await adminCommissionTrackOnCancelBet(
			gameInfos,
			gameTrackInfo.total_bet_amount
		);
		csl("cancel net_net_value : ", net_net_value);
		incease_card_bet["total_bet_amount"] = -net_net_value;

		let updateData = {
			$pull: {},
			$inc: incease_card_bet,
		};
		updateData["$pull"]["bet_users_cards." + gameTrackInfo.user_id] =
			gameTrackInfo.ticket_id;
		csl("place_bet updateData : ", updateData);

		let gameInfo = await AndarBahars.findOneAndUpdate({}, updateData, {
			new: true,
		});
		csl("place_bet userInfos : ", gameInfo);

		await play_tracks(-gameTrackInfo.total_bet_amount, {
			_id: gameTrackInfo.user_id,
		});
		await addWallet(
			gameTrackInfo.user_id,
			gameTrackInfo.total_bet_amount,
			4,
			"Andar Bahar Cancel",
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
		respSendActions.SendDataToUser(
			client,
			"ANDAR_BAHAR_CANCEL_BET",
			gameTrackInfo
		);

		delete client.cancel;

		let room = "Admin_" + gameInfo._id.toString();
		respSendActions.FireEventToTable(
			room,
			"ADMIN_ANDAR_BAHAR_GAME_INFO",
			gameInfo
		);

		return false;
	} catch (e) {
		console.log("Exception cancel :: ", e);
	}
};
