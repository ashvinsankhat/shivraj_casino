const mongoose = require("mongoose");
function connect() {
	return new Promise(resolve => {
		//mongod db connection starting here.

		// csl("Mongodb connect local_dev ",local_dev);

		let { DB_PROTO, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } =
			config;

		if (typeof DB_PROTO == "undefined" || DB_PROTO == null)
			csl("DB_PROTO is missing");
		if (typeof DB_HOST == "undefined" || DB_HOST == null)
			csl("DB_HOST is missing");
		if (typeof DB_PORT == "undefined" || DB_PORT == null)
			csl("DB_PORT is missing");
		if (typeof DB_NAME == "undefined" || DB_NAME == null)
			csl("DB_NAME is missing");

		let connectionString = `${DB_PROTO}://${
			DB_USERNAME && DB_PASSWORD ? DB_USERNAME + ":" + DB_PASSWORD + "@" : ""
		}${DB_HOST}:${DB_PORT}/${DB_NAME}`;
		if (DB_PROTO && DB_PROTO == "mongodb+srv") {
			connectionString = `${DB_PROTO}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
		} else {
			DB_PASSWORD = encodeURIComponent(DB_PASSWORD);
			connectionString = `${DB_PROTO}://${
				DB_USERNAME && DB_PASSWORD ? DB_USERNAME + ":" + DB_PASSWORD + "@" : ""
			}${DB_HOST}:${DB_PORT}/${DB_NAME}`;
		}
		console.log("Mongodb : connectionString ", connectionString);

		mongoose.connect(
			connectionString,
			{ useNewUrlParser: true, useUnifiedTopology: true },
			() => console.log("connected")
		);

		mongoose.set("useFindAndModify", false);

		var db = mongoose.connection;

		db.on("connecting", function () {
			console.log("connecting to MongoDB...");
		});

		db.on("error", function (error) {
			console.error("Error in MongoDb connection: " + error);
			// mongoose.disconnect();
		});
		db.on("connected", function () {
			console.log("MongoDB connected!");
			resolve();
		});
	});
}
module.exports = {
	connect,
};
