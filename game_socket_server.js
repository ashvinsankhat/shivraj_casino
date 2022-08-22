// process
//     .on('unhandledRejection', (reason, p) => {
//         console.log(reason, ' Unhandled Rejection at Promise ', p);
//         createSendMailFormat(p);
//     })
//     .on('uncaughtException', err => {
//         console.log('22 Uncaught Exception thrown ', err);
//         createSendMailFormat(err);
//     });

let serverType = "SOCKET_SERVER";
console.log("Server connection function", new Date());
console.log("Call connection function", new Date());
Promise.all([
	(config = require("./config/config.json")),
	require("./modules")(serverType),
]).then(() => {
	Promise.all([
		databaseConnection.connect(serverType),
		redisConnection.connect(serverType),
		amqpConnection.connect(serverType),
		// apmConnection.connect(serverType),
	]).then(() => {
		console.log("All connections are done....");
		// require('./loaders/socket')();
		// const {
		// 	test_best_cards,
		// } = require("./game_servers/lucky_cards_12/start_spin");
		// test_best_cards();
		/* socket events & connections are handled here */
		Server.listen(SERVER_PORT, function () {
			console.log(`Server listening to the port ${SERVER_PORT}`);
			eventCasesClass.init();
		});
	});
});
