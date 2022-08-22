const { addWallet } = require("./userWalletManage");
const bonusActions = require("../bonusEngine");

module.exports.appLunchDetail = async (requestData, client) => {
	let wh = {
		user_name: requestData.user_name.toString(),
		password: requestData.password.toString(),
	};
	csl("appLunchDetail wh :", wh);

	let res = await GameUser.findOne(wh, {});
	csl("appLunchDetail res : ", res);

	if (res != null) {
		if (res.flags.is_online) {
			respSendActions.SendDataToDirect(res.sck_id, "OSR", {
				is_disconnect: true,
			});
		}

		let upWhere = {
			$set: {
				device_type: requestData.device_type,
				"flags.is_online": 1,
				sck_id: client.sck_id,
			},
		};

		upWhere.$set.app_version =
			typeof requestData.app_version != "undefined" &&
			requestData.app_version != null
				? requestData.app_version
				: res.app_version;
		upWhere.$set.android_version =
			typeof requestData.android_version != "undefined" &&
			requestData.android_version != null
				? requestData.android_version
				: res.android_version;

		let wh = {
			_id: res._id,
		};

		csl("\nsignUp wh : ", JSON.stringify(wh));

		let resp2 = await GameUser.findOneAndUpdate(wh, upWhere, {
			new: true,
		}).lean();
		csl("signUp resp2 : ", JSON.stringify(resp2));

		// const wh1 = {
		// 	"player_info.user_info._id": MongoID(resp2._id.toString()),
		// };
		// const project1 = {
		// 	"player_info.$": 1,
		// };
		// const tabInfo = await RummyPlayingTables.findOne( wh1, project1);
		// csl("appLunchDetail tabInfo :: ",tabInfo);
		// if(tabInfo != null){
		//     resp2.rejoin = true;
		//     resp2.table_id = tabInfo._id;
		//     client.table_id = tabInfo._id;
		//     client.seat_index = tabInfo.player_info[0].seat_index;
		// }

		resp2.chips =
			typeof resp2.chips == "undefined" || isNaN(resp2.chips)
				? 0
				: Number(resp2.chips);
		resp2.game_winning =
			typeof resp2.game_winning == "undefined" || isNaN(resp2.game_winning)
				? 0
				: Number(resp2.game_winning);

		resp2.rejoin = typeof resp2.rejoin == "undefined" ? false : resp2.rejoin;
		csl("signUp resp2 : ", resp2.rejoin);

		await this.userSesssionSet(resp2, client);
		csl("signUp resp2 : ", resp2.rejoin);

		let response = await this._filterBeforeSendSP(resp2);
		csl("signUp response : ", response);

		respSendActions.SendDataToUser(client, "AppLunchDetails", response);

		// await this._handleMultiLogin(resp2);
	} else {
		// let userOtpWH = {
		//     "mobile_number" : mobileNumberTemp,
		//     "new_user"    : true,
		//     "code_verify" : true
		// }
		// let userOtpInfo = await UserOtp.findOne(userOtpWH, {});
		// csl("appLunchDetail userOtpInfo : ",userOtpWH, userOtpInfo);

		// if(typeof userOtpInfo == 'undefined' || userOtpInfo == null  ){
		respSendActions.SendDataToUser(
			client,
			"AppLunchDetails",
			requestData,
			true,
			"0006",
			"User Not Found, Please contact admin!",
			"Error!"
		);
		return false;
	}
	return true;
};
module.exports.referralReward = async userData => {
	let wh = {
		rfc: userData.refer_code,
	};
	let res = await GameUser.findOne(wh, {});
	csl("referralReward res : ", res);

	if (res != null) {
		let whc = {
			UserId: res._id,
		};
		let urc = await UserReferTracks.count(whc);

		await UserReferTracks.create({
			user_id: MongoID(userData._id.toString()),
			rId: MongoID(res._id.toString()),
		});
		// let reward = await bonusActions.getReferalBonus({
		//     referCounter : urc
		// })

		// if(reward.otc > 0){
		//     await walletActions.addotcWallet(userData._id.toString(), Number(reward.otc), "friend signup otc", 2);
		// }else{
		//     return false;
		// }
		return true;
	} else {
		return false;
	}
};
module.exports.getUserDefaultFields = async (data, client) => {
	/* 
    +-------------------------------------------------------------------+
        This function will return default fields of users table. this 
        function will deliver all the fields when user going to 
        register using email or facebook Or as guest login.
    +-------------------------------------------------------------------+
    */
	const t = {
		id: 0,
		display_user_name: "",
		mobile_number: data.mobile_number ? data.mobile_number : "",
		unique_id: "",
		profile_url: data.profile_url,
		device_type: data.device_type,
		chips: 0,
		game_winning: 0,
		app_version:
			typeof data.app_version == "undefined" ? "0" : data.app_version,
		android_version: data.device_type == "android" ? data.android_version : "0",
		flags: {
			is_online: 1, //is Online
			is_robot: typeof data.is_robot == "undefined" ? 0 : data.is_robot, //is robot
		},
		refferal_code: await this.getReferralCode(8),
		lasts: {
			last_login: new Date(),
		},
		counters: {
			game_win: 0,
			game_loss: 0,
		},
		rejoin: false,
		sck_id: client.sck_id,
	};
	return t;
};
module.exports.saveGameUser = async (userInfo, client) => {
	try {
		const uCounter = await this.getCount("gameusers");
		csl("saveGameUser uCounter :: ", uCounter);

		let number = "0000000000" + Number(uCounter);
		csl("saveGameUser number : ", number);

		number = number.slice(-10);

		let uniqueId = "ludo_" + number;

		userInfo.id = uCounter;
		userInfo.display_user_name = "ludo_" + uCounter;
		userInfo.unique_id = uniqueId;

		csl("saveGameUser uniqueId ::", userInfo.unique_id, userInfo.id);

		csl("\nsaveGameUser userInfo :: ", userInfo);
		let insertRes = await GameUser.create(userInfo);

		if (Object.keys(insertRes).length > 0) {
			return insertRes;
		} else {
			csl("\nsaveGameUser Error :: ", insertRes);
			return this.saveGameUser(userInfo, client);
		}
	} catch (e) {
		console.log("saveGameUser : 1 : Exception :", e);
	}
};
module.exports.getCount = async type => {
	let wh = {
		type: type,
	};
	let update = {
		$set: {
			type: type,
		},
		$inc: {
			counter: 1,
		},
	};
	csl("\ngetUserCount wh : ", wh, update);

	let resp2 = await IdCounter.findOneAndUpdate(wh, update, {
		upsert: true,
		new: true,
	});
	return resp2.counter;
};
module.exports.userSesssionSet = async (userData, client) => {
	client._id = userData._id.toString();
	client.uid = userData.id;
	client.uniqueId = userData.uniqueId;
	client.user_name = userData.display_user_name;

	csl("\nuserSesssionSet userData :: ", userData);

	let flags = userData.flags;
	csl("\nuserSesssionSet userData.flags :: ", flags);

	let session_info = {
		_id: userData._id.toString(),
		is_block: flags.is_block == 1 ? true : false,
	};
	csl("\nuserSesssionSet session_info :: ", userData.sck_id, session_info);

	await redisClass.hmsetKeys("session:" + userData.sck_id, session_info);

	return true;
};
module.exports._filterBeforeSendSP = async userData => {
	let res = {
		_id: userData._id,
		id: userData.id,
		display_user_name: userData.display_user_name,
		user_name: userData.user_name,
		profile_url: userData.profile_url,
		unique_id: userData.unique_id,
		chips: userData.chips,
		game_winning: userData.game_winning,
		table_id: userData.table_id || 0,
		rejoin: userData.rejoin,
		createdDate: userData.createdDate,
		// games : ["Points Rummy", "Pool Rummy","Deal Rummy"]
	};
	return res;
};
module.exports.getReferralCode = async length => {
	var result = "";
	var characters = "qwertyuipasdfghkjlzxcvbnmQWERTYUIPASDFGHJKLZXCVBNM";
	for (var i = 0; i < length - 1; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	var digit = "123456789";
	for (var i = result.length; i < length; i++) {
		result += digit.charAt(Math.floor(Math.random() * digit.length));
	}
	var parts = result.split("");
	for (var i = parts.length; i > 0; ) {
		var random = parseInt(Math.random() * i);
		var temp = parts[--i];
		parts[i] = parts[random];
		parts[random] = temp;
	}
	newRfc = parts.join("");
	csl("getReferralCode newRfc ::", newRfc.toLowerCase());
	return newRfc.toLowerCase();
};
