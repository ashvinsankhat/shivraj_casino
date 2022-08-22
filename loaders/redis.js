function connect() {
	return new Promise(resolve => {
		REDIS_DB = module.exports = config.REDIS_DB;

		REDIS_CONFIG = module.exports = {
			host: config.RDS_HOST,
			password: config.RDS_AUTH,
			port: 6379,
		};

		redisClient = module.exports = redis.createClient(
			REDIS_CONFIG.port,
			REDIS_CONFIG.host
		);
		/*redisClient = module.exports = redis.createClient(
            6379,"mpl-callbreak.ayd9dy.ng.0001.aps1.cache.amazonaws.com"
        );*/

		console.log("dev redisss ");
		// logger.Logger.info("dev redisss 111 ");

		redisClient.auth(REDIS_CONFIG.password, function () {}); //redis authentication

		redisClient.select(REDIS_DB);
		redisClient.on("ready", function () {
			console.log("Radis server connection done ..!!", new Date());
			resolve();
		});
		redisClient.on("error", function (rerr) {
			/*logger.Logger.error(
                "\n redisClient ---------------------------> Redis exception 22 : ",
                rerr
            );*/
			console.log(" redisClient Redis exception 22 ", rerr);
		});
		resolve();
	});
}

module.exports = {
	connect,
};
