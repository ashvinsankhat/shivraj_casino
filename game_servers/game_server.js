// process
//     .on('unhandledRejection', (reason, p) => {
//         console.log(reason, ' Unhandled Rejection at Promise ', p);
//         createSendMailFormat(p);
//     })
//     .on('uncaughtException', err => {
//         console.log('22 Uncaught Exception thrown ', err);
//         createSendMailFormat(err);
//     });

let serverType = "GAME_SERVER";
console.log("Server connection function", new Date());
console.log("Call connection function", new Date());
Promise.all([
	(config = require("../config/config.json")),
	require("../modules")(serverType),
]).then(() => {
	Promise.all([
		databaseConnection.connect(serverType),
		redisConnection.connect(serverType),
		amqpConnection.connect(serverType),
		// apmConnection.connect(serverType),
	]).then(async () => {
		const { lucky_16_start_game } = require("./lucky_cards/start_game");
		lucky_16_start_game();

		const { lucky_12_start_game } = require("./lucky_cards_12/start_game");
		lucky_12_start_game();

		const { triple_start_game } = require("./triple/start_game");
		triple_start_game();

		const { roulette_start_game } = require("./roulette/start_game");
		roulette_start_game();

		const { roulette_zero_start_game } = require("./roulette_zero/start_game");
		roulette_zero_start_game();

		const { single_chance_start_game } = require("./signle_chance/start_game");
		single_chance_start_game();

		const {
			roulette_zero_3d_start_game,
		} = require("./roulette_zero_3d/start_game");
		roulette_zero_3d_start_game();

		const {
			single_chance_3d_start_game,
		} = require("./signle_chance_3d/start_game");
		single_chance_3d_start_game();

		const { andar_bahar_start_game } = require("./andar_bahar/start_game");
		andar_bahar_start_game();

		const {
			roulette_european_start_game,
		} = require("./roulette_european/start_game");
		roulette_european_start_game();

		const { lucky_sorat_start_game } = require("./lucky_sorat/start_game");
		lucky_sorat_start_game();
	});
});
