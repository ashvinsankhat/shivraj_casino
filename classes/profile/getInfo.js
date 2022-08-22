module.exports.getProfileInfo = async (reqestData, client) => {
	try {
		let wh = {
			_id: client._id,
		};
		let project = {
			display_user_name: 1,
			profile_url: 1,
			chips: 1,
			game_winning: 1,
			counters: 1,
		};
		csl("getProfileInfo wh , project: ", wh, project);
		let userInfos = await GameUser.findOne(wh, project);
		csl("getProfileInfo userInfos : ", userInfos);

		respSendActions.SendDataToUser(client, "PROFILE_INFO", userInfos);
	} catch (e) {
		console.log("Exception getProfileInfo : ", e);
	}
};
module.exports.getWalletDetails = async (reqestData, client) => {
	try {
		let wh = {
			_id: client._id,
		};
		let project = {
			display_user_name: 1,
			profile_url: 1,
			chips: 1,
			game_winning: 1,
			counters: 1,
		};
		csl("getProfileInfo wh , project: ", wh, project);
		let userInfos = await GameUser.findOne(wh, project);
		csl("getProfileInfo userInfos : ", userInfos);

		respSendActions.SendDataToUser(client, "WALLET_DEATILS", userInfos);
	} catch (e) {
		console.log("Exception getProfileInfo : ", e);
	}
};
module.exports.getAccountInfo = async (reqestData, client) => {
	try {
		let wh = {
			user_id: client._id,
		};
		let project = {};
		csl("getProfileInfo wh , project: ", wh, project);
		let userInfos = await AccountDetails.findOne(wh, project);
		csl("getProfileInfo userInfos : ", userInfos);
		if (userInfos == null) {
			userInfos = {
				user_id: client._id,
				adhar_url: "",
				adhar_status: false,
				pan_url: "",
				pan_status: false,
				name: "",
				ifsc: "",
				accno: "",
				mobile: "",
				upi: "",
				reason: "",
			};
		}
		respSendActions.SendDataToUser(client, "ACCOUNT_INFO", userInfos);
	} catch (e) {
		console.log("Exception getProfileInfo : ", e);
	}
};
module.exports.getAvatar = async (reqestData, client) => {
	try {
		let wh = {
			is_active: true,
		};
		let project = {};
		let avatars = await Avatar.find(wh, project);
		csl("getProfileInfo avatars : ", avatars);

		respSendActions.SendDataToUser(client, "AVATARS", {
			lists: avatars,
		});
	} catch (e) {
		console.log("Exception getProfileInfo : ", e);
	}
};
