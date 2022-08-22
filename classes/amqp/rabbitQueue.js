CreateQueues = async (serverString, serverType) => {
	rabbitConn.queue(
		"users-" + SERVER_ID + serverString,
		{
			exclusive: false,
			arguments: {
				"x-message-ttl": 5000,
				"x-max-length": 5000,
			},
		},
		function (queues) {
			queues.bind(playExchange, "userm.*");
			queues.bind(playExchange, "tablem.*");
			queues.bind(playExchange, "globle.*");
			queues.bind(playExchange, "tournament.*");

			queues.subscribe(function (
				message,
				headers,
				deliveryInfo,
				messageObject
			) {
				if (message == null) return false;

				if (serverType == "SOCKET_SERVER") {
					// csl("RabbitMq  deliveryInfo.routingKey : ", deliveryInfo.routingKey);
					if (deliveryInfo.routingKey.indexOf("userm") != -1) {
						var socketid = deliveryInfo.routingKey.replace("userm.", "");

						console.log("OSR message.data.en : ", message.data);
						if (message.data.en == "OSR") {
							io.sockets.connected[uid].disconnect();
						}

						if (typeof socketid != "undefined") {
							if (
								typeof io.sockets.connected[socketid] != "undefined" &&
								io.sockets.connected[socketid]
							) {
								var encrytedData = message;
								message.receive = new Date();
								io.sockets.connected[socketid].emit("res", encrytedData);
							}
						}
					} else if (deliveryInfo.routingKey.indexOf("tablem") != -1) {
						let room = deliveryInfo.routingKey.replace("tablem.", "");

						//room must be exists in routing key.

						if (
							typeof room == "undefined" ||
							room == null ||
							room == "undefined"
						) {
							return false;
						}

						let eData = message;
						// console.log("\nroom ====> ", room)
						// console.log("eData ====> ",  eData);
						if (typeof io.to(room) != "undefined") {
							io.to(room).emit("res", eData);
						}
					} else if (deliveryInfo.routingKey.indexOf("globle") != -1) {
						// csl("RabbitMq  message.en : ", message.en, message.data);

						if (message.en == "CLEAR_JOB") {
							if (message.data.jid != null) {
								schedule.cancelJob(message.data.jid);
							}
						} else if (message.en == "JOIN_TOUR_ROOM") {
							if (io.sockets.connected[message.data.sck_id.toString()]) {
								io.sockets.connected[message.data.sck_id.toString()].join(
									message.data.room_name.toString()
								);
							}
						} else if (message.en == "JOIN_ROOM") {
							if (io.sockets.connected[message.data.sck_id.toString()]) {
								csl("Game room joined...!");
								io.sockets.connected[message.data.sck_id.toString()].join(
									message.data.table_id.toString()
								);
							}
						} else if (message.en == "LEAVE_ROOM") {
							if (io.sockets.connected[message.data.sck_id.toString()]) {
								csl("Game room leaved...!");
								io.sockets.connected[message.data.sck_id.toString()].leave(
									message.data.table_id.toString()
								);
							}
						} else if (message.en == "LUCKY_16_GAME_CONFIG") {
							globleConfigClass.lucky16CardConfigUpdate();
						}
					}
				}

				message = null;
				headers = null;
				deliveryInfo = null;
				messageObject = null;
			});
		}
	);
};

module.exports = {
	CreateQueues,
};
