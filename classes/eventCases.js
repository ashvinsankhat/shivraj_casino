const securityActions = require("./encry&decry");

const lucky_cards = require("./lucky_cards");
const lucky_cards_12 = require("./lucky_cards_12");

const roulette = require("./roulette");
const roulette_zero = require("./roulette_zero");
const roulette_zero_3d = require("./roulette_zero_3d");
const roulette_european = require("./roulette_european");

const single_chance = require("./single_chance");
const single_chance_3d = require("./single_chance_3d");

const andar_bahar = require("./andar_bahar");
const lucky_sorat = require("./lucky_sorat");

const triple = require("./triple");
const profile = require("./profile");
const dashboard = require("./dashboard");
const withdraw = require("./withdraw");
const deposit = require("./deposit");

init = async () => {
	let cPlayers = await redisClass.zscore("servers", SERVER_ID);
	if (parseInt(cPlayers) > 0)
		await redisClass.decrby("onlinePlayers", cPlayers); //decrements the players which are connected to this

	var setData = [
		SERVER_ID,
		"host",
		SERVICE_HOST,
		"port",
		SERVER_PORT,
		"proto",
		SERVER_PROTO,
	];
	csl("init : serdata : ", setData);
	await redisClass.hmset(setData);
	cPlayers = cPlayers && cPlayers != null ? cPlayers : 0;
	await redisClass.zadd("servers", cPlayers, SERVER_ID);

	globleConfigClass.lucky16CardConfigUpdate();
};
bindSocketToEvent = async client => {
	if (typeof client == "undefined") return false;

	let mainId = client.id;
	await redisClass.hmsetKeys("session:" + mainId, {
		frm: "io",
	});
	await redisClass.expireKey("session:" + mainId, 300);
	client.sck_id = mainId;

	client.on("req", async requestedData => {
		await redisClass.expireKey("session:" + client.sck_id, 300);
		requestedData = securityActions.decryption(requestedData);

		// if (typeof requestedData == 'string' && !config.IS_DEV_MODE)
		//     requestedData = commonClass.Dec(requestedData);
		// else
		//     requestedData = commonClass.parseJSON(requestedData);

		client.removeListener("req", function () {});
		if (requestedData == null) return false;

		let session_info = await redisClass.hgetall("session:" + client.sck_id);
		csl("\nSession session_info :", session_info);

		if (typeof requestedData.en != "undefined") {
			en = requestedData.en;
		} else {
			en = "error";
		}

		if (requestedData.en != "HB") {
			csl(
				"\nRequest : en :" +
					requestedData.en +
					" : Data : " +
					JSON.stringify(requestedData)
			);
		}

		if (session_info.is_block == "true") {
			respSendActions.SendDataToUser(client, "USER_BLOCK", {
				is_block: true,
				message: "You are block now, please contact Admin!!",
			});
			return false;
		}

		for (let key in session_info) {
			if (["seat_index"].indexOf(key) != -1) {
				client[key] = Number(session_info[key]);
			} else {
				client[key] = session_info[key];
			}
		}

		if (requestedData.en.indexOf("LUCKY_SORAT_") != -1) {
			lucky_sorat.eventHandler(requestedData.en, requestedData.data, client);
			return false;
		}
		if (requestedData.en.indexOf("ANDAR_BAHAR_") != -1) {
			andar_bahar.eventHandler(requestedData.en, requestedData.data, client);
			return false;
		}
		if (requestedData.en.indexOf("SINGLE_CHANCE_3D_") != -1) {
			single_chance_3d.eventHandler(
				requestedData.en,
				requestedData.data,
				client
			);
			return false;
		}
		if (requestedData.en.indexOf("SINGLE_CHANCE_") != -1) {
			single_chance.eventHandler(requestedData.en, requestedData.data, client);
			return false;
		}
		if (requestedData.en.indexOf("ROULETTE_EUROPEAN_") != -1) {
			roulette_european.eventHandler(
				requestedData.en,
				requestedData.data,
				client
			);
			return false;
		}
		if (requestedData.en.indexOf("ROULETTE_ZERO_3D_") != -1) {
			roulette_zero_3d.eventHandler(
				requestedData.en,
				requestedData.data,
				client
			);
			return false;
		}
		if (requestedData.en.indexOf("ROULETTE_ZERO_") != -1) {
			roulette_zero.eventHandler(requestedData.en, requestedData.data, client);
			return false;
		}
		if (requestedData.en.indexOf("ROULETTE_") != -1) {
			roulette.eventHandler(requestedData.en, requestedData.data, client);
			return false;
		}
		if (requestedData.en.indexOf("LUCKY_CARD_12") != -1) {
			lucky_cards_12.eventHandler(requestedData.en, requestedData.data, client);
			return false;
		}
		if (requestedData.en.indexOf("LUCKY_CARD_") != -1) {
			lucky_cards.eventHandler(requestedData.en, requestedData.data, client);
			return false;
		}
		if (requestedData.en.indexOf("TRIPLE_") != -1) {
			triple.eventHandler(requestedData.en, requestedData.data, client);
			return false;
		}

		switch (en) {
			case "PROFILE_INFO":
				profile.getProfileInfo(requestedData.data, client);
				break;
			case "RESET_PASSWORD":
				profile.resetPassword(requestedData.data, client);
				break;

			case "AVATARS":
				profile.getAvatar(requestedData.data, client);
				break;

			case "UPDATE_PROFILE":
				profile.updateProfile(requestedData.data, client);
				break;

			case "WALLET_DEATILS":
				profile.getWalletDetails(requestedData.data, client);
				break;

			case "LEADERBOARD":
				dashboard.getLeaderboard(requestedData.data, client);
				break;

			case "TRANSACTIONS":
				dashboard.getTransactionHistory(requestedData.data, client);
				break;

			case "WITHDRAW_DETAILS":
				withdraw.getUserInfo(requestedData.data, client);
				break;

			case "PLACE_WITHDRAW_REQUEST":
				withdraw.placeRequest(requestedData.data, client);
				break;

			case "CANCEL_WITHDRAW_REQUEST":
				withdraw.cancelRequest(requestedData.data, client);
				break;

			case "DEPOSIT_DETAILS":
				deposit.getUserInfo(requestedData.data, client);
				break;

			case "PROCESS_DEPOSIT_REQUEST":
				deposit.processRequest(requestedData.data, client);
				break;

			case "SUCCESS_PAYMENT_REQUEST":
				deposit.successPayment(requestedData.data, client);
				break;

			case "VERIFY_ACCOUNT":
				profile.verifyAccountDetails(requestedData.data, client);
				break;

			case "ACCOUNT_INFO":
				profile.getAccountInfo(requestedData.data, client);
				break;

			case "CRC":
			case "CMN":
			case "SIGNUP":
			case "LOGIN":
			case "ROTP":
			case "VOTP":
			case "AppLunchDetails":
				signupClass[en](requestedData.data, client);
				break;
		}
	});
	//deleting socket id from player Array on connection close from device.
	client.on("hb", async function (request) {
		client.emit(
			"res",
			securityActions.encrypation({
				en: "hb",
				data: {},
			})
		);

		await redisClass.expireKey("hb:" + client.sck_id, 35);
		await redisClass.expireKey("session:" + client.sck_id, 300);

		client.removeListener("hb", function () {});
	});
	client.on("error", function (exc) {
		console.log("ignoring exception: " + exc);
	});

	//deleting socket id from player Array on connection close from device.
	client.on("disconnect", async function (cause) {
		csl("socket disconnect after timer complete ", client.id, cause);

		await redisClass.zincrby("servers", -1, SERVER_ID);
		await redisClass.incr("onlinePlayers", -1);

		await redisClass.expireKey("session:" + client.id, 5);

		let session_info = await redisClass.hgetall("session:" + client.sck_id);
		csl("\nSession session_info :", session_info);

		await newDisconnect(client, cause, session_info);

		if (typeof client.table_id != "undefined") {
			await lucky_cards.eventHandler("LUCKY_CARD_CLOSE_GAME", {}, client);
			await lucky_cards_12.eventHandler("LUCKY_CARD_12_CLOSE_GAME", {}, client);
		}
	});
};
newDisconnect = async (client, cause, session_info) => {
	try {
		if (cause == "server namespace disconnect") return false;
		redisClass.del("session:" + client.sck_id); //deleting userid from redis.
		if (client._id) {
			let wh = {
				_id: MongoID(client._id.toString()),
			};

			let updateData = {
				$set: {
					sck_id: "",
					"flags.is_online": 0,
				},
			};
			csl("newDisconnect session_info ::", session_info);
			if (
				typeof session_info.table_id != "undefined" &&
				session_info.table_id != ""
			) {
				updateData["$set"]["rejoin"] = true;
			} else {
				updateData["$set"]["rejoin"] = false;
			}
			csl("newDisconnect wh, updateData  ::", wh, updateData);

			let upReps = await GameUser.findOneAndUpdate(wh, updateData, {
				new: true,
			});
			csl("newDisconnect upReps :: ", upReps);
		}
	} catch (e) {
		console.log("newDisconnect : 1 : Exception :", e);
	}
};
module.exports = {
	bindSocketToEvent,
	init,
};
