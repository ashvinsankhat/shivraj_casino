const {
	getProfileInfo,
	getAvatar,
	getWalletDetails,
	getAccountInfo,
} = require("./getInfo");
const {
	updateProfile,
	resetPassword,
	verifyAccountDetails,
} = require("./update");

module.exports = {
	getProfileInfo: getProfileInfo,
	getAccountInfo: getAccountInfo,
	getAvatar: getAvatar,
	getWalletDetails: getWalletDetails,
	verifyAccountDetails: verifyAccountDetails,
	updateProfile: updateProfile,
	resetPassword: resetPassword,
};
