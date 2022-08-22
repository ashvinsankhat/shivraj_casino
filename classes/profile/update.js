const { getProfileInfo, getAccountInfo } = require("./getInfo");

module.exports.updateProfile = async (reqestData, client) => {
	try {
		let wh = {
			_id: client._id,
		};
		let updateData = {
			$set: {},
		};
		if (reqestData.type == "avatar") {
			updateData["$set"]["profile_url"] = reqestData.profile_url;
		}
		if (reqestData.type == "user_name") {
			updateData["$set"]["display_user_name"] = reqestData.display_user_name;
		}
		csl("updateProfile updateData : ", updateData);
		if (Object.keys(updateData.$set).length > 0) {
			let userInfos = await GameUser.findOneAndUpdate(wh, updateData, {
				new: true,
			});
			csl("updateProfile userInfos : ", userInfos);

			getProfileInfo(reqestData, client);
		} else {
			respSendActions.SendDataToUser(
				client,
				"UPDATE_PROFILE",
				{},
				true,
				"6001",
				"Issue in profile update!",
				"Error!"
			);
		}
	} catch (e) {
		console.log("Exception updateProfile : ", e);
	}
};
module.exports.resetPassword = async (reqestData, client) => {
	try {
		let wh = {
			_id: client._id,
		};
		let updateData = {
			$set: {
				password: reqestData.new_password,
			},
		};

		let userInfos = await GameUser.findOneAndUpdate(wh, updateData, {
			new: true,
		});
		csl("resetPassword userInfos : ", userInfos);
		respSendActions.SendDataToUser(
			client,
			"RESET_PASSWORD",
			{},
			true,
			"1111",
			"Password update successfull",
			"Secuss!"
		);
	} catch (e) {
		console.log("Exception updateProfile : ", e);
	}
};
module.exports.verifyAccountDetails = async (reqestData, client) => {
	try {
		let wh = {
			user_id: client._id,
		};
		let updateData = {
			$set: {},
		};
		csl("verifyAccountDetails reqestData.adhar_url :", reqestData.adhar_url);
		if (reqestData.adhar_url) {
			updateData["$set"]["adhar_url"] = reqestData.adhar_url;
			updateData["$set"]["adhar_status"] = false;
		}
		if (reqestData.pan_url) {
			updateData["$set"]["pan_url"] = reqestData.pan_url;
			updateData["$set"]["pan_status"] = false;
		}
		if (reqestData.name) {
			updateData["$set"]["name"] = reqestData.name;
		}
		if (reqestData.ifsc) {
			updateData["$set"]["ifsc"] = reqestData.ifsc;
		}
		if (reqestData.accno) {
			updateData["$set"]["accno"] = reqestData.accno;
		}
		if (reqestData.mobile) {
			updateData["$set"]["mobile"] = reqestData.mobile;
		}
		if (reqestData.upi) {
			updateData["$set"]["upi"] = reqestData.upi;
		}

		csl("updateProfile updateData : ", updateData);
		if (Object.keys(updateData.$set).length > 0) {
			let details = await AccountDetails.findOne(wh, {});
			csl("updateProfile details : ", details);
			if (details == null) {
				updateData["$set"]["user_id"] = client._id;
				let data = await AccountDetails.create(updateData["$set"]);
				csl("updateProfile data : ", data);
			} else {
				let userInfos = await AccountDetails.findOneAndUpdate(wh, updateData, {
					new: true,
				});
				csl("updateProfile userInfos : ", userInfos);
			}
			getAccountInfo(reqestData, client);
		} else {
			respSendActions.SendDataToUser(
				client,
				"VERIFY_ACCOUNT",
				{},
				true,
				"6001",
				"Issue in account details update!",
				"Error!"
			);
		}
	} catch (e) {
		console.log("Exception updateProfile : ", e);
	}
};
