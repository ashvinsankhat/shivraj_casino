module.exports = serverType => {
	Server = module.exports = "";
	if (SERVICE_HOST == "https") {
		if (
			fileSystem.readFileSync("certificate/normalKey.key") &&
			fileSystem.readFileSync("certificate/screteKey.crt")
		) {
			console.log("File get");
		} else {
			console.log("File not get");
		}
		var httpsOptions = {
			key: fileSystem.readFileSync("certificate/normalKey.key"),
			cert: fileSystem.readFileSync("certificate/screteKey.crt"),
		};
		Server = https.createServer(httpsOptions, app);
		console.log("Dev server here");
		// logger.Logger.info("Dev server here .....;");
		// var Server = require("https").createServer(httpsOptions, app);
	} else {
		Server = http.createServer(app);
		console.log("Local server here");
		// logger.Logger.info("Local servere here...");
	}
	csl("Socket Server ==================>", serverType);
	if (serverType == "SOCKET_SERVER") {
		io = module.exports = socketIO.listen(Server, {
			origins: "*:*",
			pingTimeout: 5000,
			pingInterval: 20000,
			namespace: "/",
		});

		io.sockets.on("connection", async function (socket) {
			csl("New connection " + socket.id);
			// loggerClass.Logger("LOGGER L001", "Socket connected", socket.id);
			// console.log("user connected to socket socket_id=>", socket.id);
			socket.emit("isConnected", {
				connection: `your socket_id ${socket.id}`,
			});

			await redisClass.zincrby("servers", 1, SERVER_ID);
			await redisClass.incr("onlinePlayers");

			eventCasesClass.bindSocketToEvent(socket);

			socket.conn.on("packet", function (packet) {
				if (packet.type === "ping") {
					// c("Ping received......")
				}
			});
		});
	} else {
	}
};
