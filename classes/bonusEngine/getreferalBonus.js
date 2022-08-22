module.exports.getReferalBonus = async reqestData => {
	let bonusData = {
		bonus: reqestData.referCounter < 7 ? 10 : 0,
	};
	return bonusData;
};
