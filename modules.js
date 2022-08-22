//load configuration data

module.exports = async serverType => {
	http = require("http");
	https = require("https");
	path = require("path");
	redis = require("redis");
	amqp = require("amqp");
	mongoose = require("mongoose");
	moment = require("moment");
	dateFormat = require("dateformat");
	randomString = require("randomstring");
	fs = require("graceful-fs");
	moment = require("moment");
	rq = require("request");
	request = rq;
	_ = require("underscore");
	schedule = require("node-schedule");
	express = require("express");
	bodyParser = require("body-parser");
	socketIO = require("socket.io");
	urlencode = require("urlencode");
	favicon = require("serve-favicon");
	methodOverride = require("method-override");
	multer = require("multer");
	s3 = require("multer-s3");
	fortuna = require("javascript-fortuna");
	fortuna.init();

	SERVER_PORT = process.argv[2];
	SERVICE_HOST = process.argv[3];
	SERVER_ID = process.argv[4] ? process.argv[4] : "sw_1";
	csl = function (arr) {
		let flage = true;
		if (serverType == "GAME_SERVER") {
			flage = false;
		}

		if (flage) {
			try {
				// console.log("\n")
				var str = "";
				for (var i = 0; i < arguments.length; i++) {
					str += " ";
					if (typeof arguments[i] == "undefined" || arguments[i] == null)
						str += "";
					else if (typeof arguments[i] == "object")
						str += JSON.stringify(arguments[i]);
					else if (typeof arguments[i] == "string") str += arguments[i];
					else if (typeof arguments[i] == "number") str += arguments[i];
					else if (typeof arguments[i] == "boolean")
						str += Number(arguments[i]);
					else if (typeof arguments[i] == "undefined") str += "undefined";
					else if (arguments[i] == null) str += "null";
				}
				// console.log(str);
				console.log(str);
			} catch (e) {
				// console.log("csl : Exception : ", e);
				console.log("csl : Exception : " + e.toString());
			}
		}
	};
	scl = function (arr) {
		let flage = true;

		if (flage) {
			try {
				// console.log("\n")
				var str = "";
				for (var i = 0; i < arguments.length; i++) {
					str += " ";
					if (typeof arguments[i] == "undefined" || arguments[i] == null)
						str += "";
					else if (typeof arguments[i] == "object")
						str += JSON.stringify(arguments[i]);
					else if (typeof arguments[i] == "string") str += arguments[i];
					else if (typeof arguments[i] == "number") str += arguments[i];
					else if (typeof arguments[i] == "boolean")
						str += Number(arguments[i]);
					else if (typeof arguments[i] == "undefined") str += "undefined";
					else if (arguments[i] == null) str += "null";
				}
				// console.log(str);
				console.log(str);
			} catch (e) {
				// console.log("csl : Exception : ", e);
				console.log("csl : Exception : " + e.toString());
			}
		}
	};
	csl(" Ludo : config : ", config);

	gamePath = __dirname;
	fileName = __filename;

	base_dirname = __dirname;
	// MongoClient  = mongod.MongoClient;
	// MongoID      = mongod.ObjectID; //reporting conversion class instavle to global for convert string to object
	MongoID = mongoose.Types.ObjectId;

	// Loaders
	databaseConnection = require("./loaders/mongodb");
	redisConnection = require("./loaders/redis");
	amqpConnection = require("./loaders/amqp");
	// apmConnection   		= require('./loaders/apm');
	expressAp = require("./loaders/express")(serverType);
	redisClass = require("./classes/redis/redis.js");
	socketcall = require("./loaders/socket")(serverType);

	commonClass = require("./classes/common");

	serverString32 = await commonClass.GetRandomString(32);
	serverString = await commonClass.GetRandomString(16);

	SERVER_PROTO = SERVICE_HOST == "localhost" ? "http" : "https";

	process.setMaxListeners(0);

	modelsClass = require("./model");
	amqpClass = require("./classes/amqp/rabbitQueue.js");
	respSendActions = require("./classes/amqp/sendAmqp");

	scheduleClass = require("./classes/scheduler/scheduler");

	gameWalletTracks = require("./classes/gameWallet");
	globleConfigClass = require("./classes/globleConfig");

	signupClass = require("./classes/signupClass");

	eventCasesClass = require("./classes/eventCases.js");

	// const { test_code } = require("./game_servers/triple/start_spin");
	// test_code();
	if (serverType == "API_SERVER") apiCall = require("./classes/apis/api");

	// const securityActions = require("./classes/encry&decry");
	// let string = "SEyRyyUtDRMjiPQO9rxlLQS9KtENISNB3x/CgcB4HTY8krod+J3v9ngHXiOuJJGWUCOYJHr47hMKBHgNPacLhKSAY01Q9FrtaxBm4pb/yCc="
	// let respo = securityActions.decryption(string);

	// csl("respo : => ",respo)
};
