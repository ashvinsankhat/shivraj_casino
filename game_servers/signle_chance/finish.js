const start_gst = require("./start_gst");

const { get_admin_game_info } = require("./admin_game_info");

module.exports.finish_round = async game_info => {
	csl("finish_round game_info : ", game_info);
	let wh = {
		_id: game_info._id,
	};
	let updateData = {
		$set: {
			game_state: "finish_state",
			bet_users_cards: {},
			winner_users: [],
			user_total_bet_amount: 0,
			total_bet_on_cards: {},
			game_time: {
				init_time: new Date(),
			},
			"game_config.REWARD_X": 0,
		},
	};

	csl("finish_round wh , project 1: ", wh, updateData);

	let gameInfo = await SingleChancePlayings.findOneAndUpdate(wh, updateData, {
		new: true,
	}).lean();
	scl("\nsingle_chance_finish_round gameInfo : ", gameInfo);

	let updateConfigData = {
		$set: {
			reward_x: 0,
			reward_card: "",
		},
	};
	csl("finish_round updateConfigData : ", updateConfigData);
	let configDetails = await GameConfigs.findOneAndUpdate(
		{
			game_type: "single_chance",
		},
		updateConfigData,
		{ new: true }
	).lean();
	csl("finish_round configDetails : ", configDetails);

	let timer =
		typeof gameInfo.game_config != "undefined" &&
		typeof gameInfo.game_config.NEXT_GAME_TIME != "undefined"
			? gameInfo.game_config.NEXT_GAME_TIME
			: 5;
	csl("finish_round timer : ", timer);

	let response = {
		time: 0,
		msg: "New Round Start",
	};
	respSendActions.FireEventToTable(
		gameInfo._id.toString(),
		"SINGLE_CHANCE_INIT_GAME",
		response
	);

	get_admin_game_info(gameInfo);

	let job_id = "INIT:" + gameInfo._id;
	const turnExpireTime = await commonClass.AddTime(timer);
	csl("finish_round  timer ::", job_id, new Date(), new Date(turnExpireTime));

	let table_id = gameInfo._id;
	const delayRes = await scheduleClass.setScheduler(
		job_id,
		new Date(turnExpireTime)
	);
	csl("finish_round  delayRes: ", delayRes);

	await start_gst.start_game_timer(table_id);

	return true;
};
