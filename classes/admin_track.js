module.exports.adminCommissionTrack = async (gameInfo, bet_value) => {
	csl("\nadminCommissionTrack : ", bet_value, gameInfo);

	let game_config = await GameConfigs.findOne(
		{
			game_type: gameInfo.game_type,
		},
		{ winning_percentage: 1 }
	).lean();
	csl("adminCommissionTrack  game_config: ", game_config);

	let winning_percentage = game_config.winning_percentage
		? game_config.winning_percentage
		: 0;
	let commission_amount = bet_value * (winning_percentage / 100);
	let game_Wallet = Number(bet_value - commission_amount);

	console.log(
		"adminCommissionTrack  commission_amount: ",
		commission_amount,
		game_Wallet
	);

	let adminCommissionInfo = await AdminCommissionTracks.findOneAndUpdate(
		{ game_id: gameInfo.game_id, game_type: gameInfo.game_type },
		{
			$set: {
				game_id: gameInfo.game_id,
				game_type: gameInfo.game_type,
			},
			$inc: {
				total_bet_amount: bet_value,
				commission_amount: commission_amount,
			},
		},
		{
			new: true,
			upsert: true,
		}
	);
	csl("adminCommissionTrack  adminCommissionInfo: ", adminCommissionInfo);
	return game_Wallet;
};
module.exports.adminCommissionTrackOnCancelBet = async (
	gameInfo,
	bet_value
) => {
	csl("\nadminCommissionTrackOnCancelBet : ", bet_value, gameInfo);

	let game_config = await GameConfigs.findOne(
		{
			game_type: gameInfo.game_type,
		},
		{ winning_percentage: 1 }
	).lean();
	csl("adminCommissionTrackOnCancelBet  game_config: ", game_config);

	let winning_percentage = game_config.winning_percentage
		? game_config.winning_percentage
		: 0;
	let commission_amount = bet_value * (winning_percentage / 100);
	let game_Wallet = Number(bet_value - commission_amount);

	console.log(
		"adminCommissionTrackOnCancelBet  commission_amount: ",
		commission_amount,
		game_Wallet
	);

	let adminCommissionInfo = await AdminCommissionTracks.findOneAndUpdate(
		{ game_id: gameInfo.game_id, game_type: gameInfo.game_type },
		{
			$set: {
				game_id: gameInfo.game_id,
				game_type: gameInfo.game_type,
			},
			$inc: {
				total_bet_amount: -bet_value,
				commission_amount: -commission_amount,
			},
		},
		{
			new: true,
			upsert: true,
		}
	);
	csl(
		"adminCommissionTrackOnCancelBet  adminCommissionInfo: ",
		adminCommissionInfo
	);
	return game_Wallet;
};
