module.exports.adminCommissionTrack = async (
	gameInfo,
	winning_percentage,
	net_pay_amount,
	admin_bal
) => {
	scl(
		"\nadminCommissionTrack : ",
		gameInfo.total_bet_amount,
		net_pay_amount,
		winning_percentage
	);

	await AdminCommissionTracks.create({
		game_id: gameInfo.game_id,
		game_type: gameInfo.game_type,
		total_bet_amount: gameInfo.user_total_bet_amount,
		game_wallet: admin_bal,
		commission_rate: 100 - Number(winning_percentage),
		commission_amount: admin_bal - net_pay_amount,
	});
	return true;
};
