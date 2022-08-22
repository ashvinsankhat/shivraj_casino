const { start_spin } = require("./start_spin");
const { get_admin_game_info } = require("./admin_game_info");

const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", 12);

module.exports.start_game_timer = async table_id => {
	let gameId = await this.getGameId();
	let wh = {
		_id: table_id,
	};
	let updateData = {
		$set: {
			game_state: "game_timer_start",
			game_id: gameId,
			game_type: "roulette_european",
			winners: 0,
			"game_time.gst_time": new Date(),
		},
	};
	csl("start_game_timer wh , project 1: ", wh, updateData);

	let gameInfo = await RouletteEuropeanPlayings.findOneAndUpdate(
		wh,
		updateData,
		{ new: true }
	).lean();
	scl("roulette_european_start_game_timer userInfos : ", gameInfo);

	let timer =
		typeof gameInfo.game_config != "undefined" &&
		typeof gameInfo.game_config.DRAW_TIME != "undefined"
			? gameInfo.game_config.DRAW_TIME
			: 60;
	csl("start_game_timer timer : ", timer);

	let response = {
		game_id: gameId.game_id,
		timer: timer,
	};
	respSendActions.FireEventToTable(
		gameInfo._id.toString(),
		"ROULETTE_EUROPEAN_GAME_TIMER_START",
		response
	);

	get_admin_game_info(gameInfo);

	let job_id = "GST:" + gameInfo._id;
	const turnExpireTime = await commonClass.AddTime(timer);
	csl("start_game_timer : ", job_id, new Date(), new Date(turnExpireTime));

	let tab_id = gameInfo._id;
	const delayRes = await scheduleClass.setScheduler(
		job_id,
		new Date(turnExpireTime)
	);
	csl("start_game_timer  delayRes: ", delayRes);

	await start_spin(tab_id);
	return false;
};
module.exports.getGameId = async () => {
	let id = nanoid();
	return id;
};
