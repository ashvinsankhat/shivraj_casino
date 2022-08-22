const {
	addRetailerWallet,
	addDistributerWallet,
	addSuperDistributerWallet,
} = require("./wallet_update");
module.exports.win_tracks = async (
	play_amount,
	win_amount,
	commission_rate,
	client
) => {
	let date1 = new Date();
	date1.setSeconds(date1.getSeconds() + Number(19800));
	let date = dateFormat(new Date(date1), "d:mm:yyyy");
	csl("\nwin_tracks date :: ", date);
	let wh = {
		user_id: client._id,
		game_type: "roulette_european",
		date: date,
	};
	let trackInfo = await Lucky16ReportTracks.findOne(wh, {});
	csl("win_tracks trackInfo :: ", trackInfo);

	if (trackInfo == null) {
		trackInfo = await Lucky16ReportTracks.create(wh);
	}

	let end_amount = Number(
		(Number(play_amount) - Number(win_amount)).toFixed(2)
	);
	csl("win_tracks end_amount, play_amount :: ", end_amount, play_amount);

	let total_commision = await this.add_commission(play_amount, client);
	csl("win_tracks total_commision :: ", total_commision);

	let ntp_amount = end_amount - total_commision;
	csl("win_tracks ntp_amount :: ", ntp_amount);

	let updateData = {
		$set: {
			user_id: client._id,
			date: date,
		},
		$inc: {
			end_amount: end_amount,
			win_amount: win_amount,
			commission_amount: total_commision,
			ntp_amount: ntp_amount,
		},
	};
	csl("win_tracks wh , updateData:: ", wh, updateData);

	let upReps = await Lucky16ReportTracks.findOneAndUpdate(wh, updateData, {
		new: true,
	});
	csl("win_tracks upReps :: ", upReps);

	return total_commision;
};
module.exports.loss_tracks = async (
	play_amount,
	win_amount,
	commission_rate,
	client
) => {
	let date1 = new Date();
	date1.setSeconds(date1.getSeconds() + Number(19800));
	let date = dateFormat(new Date(date1), "d:mm:yyyy");
	csl("\nloss_tracks date :: ", date);
	let wh = {
		user_id: client._id,
		game_type: "roulette_european",
		date: date,
	};
	let trackInfo = await Lucky16ReportTracks.findOne(wh, {});
	csl("loss_tracks trackInfo :: ", trackInfo);

	if (trackInfo == null) {
		trackInfo = await Lucky16ReportTracks.create(wh);
	}

	let end_amount = Number(
		(Number(play_amount) - Number(win_amount)).toFixed(2)
	);
	csl("loss_tracks end_amount, play_amount :: ", end_amount, play_amount);

	let total_commision = await this.add_commission(play_amount, client);
	csl("loss_tracks total_commision :: ", total_commision);

	let ntp_amount = end_amount - total_commision;
	csl("loss_tracks ntp_amount :: ", ntp_amount);

	let updateData = {
		$set: {
			user_id: client._id,
			date: date,
		},
		$inc: {
			commission_amount: total_commision,
			end_amount: end_amount,
			ntp_amount: ntp_amount,
		},
	};
	csl("loss_tracks wh , updateData:: ", wh, updateData);

	let upReps = await Lucky16ReportTracks.findOneAndUpdate(wh, updateData, {
		new: true,
	});
	csl("loss_tracks upReps :: ", upReps);

	return total_commision;
};
module.exports.add_commission = async (play_amount, client) => {
	let pipeline = [
		{
			$match: {
				_id: client._id,
			},
		},
		{
			$lookup: {
				from: "distributer_users",
				let: { distributer_id: "$refferal_id" },
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [{ $eq: ["$_id", "$$distributer_id"] }],
							},
						},
					},
					{
						$project: {
							cards_16_config: 1,
							user_name: 1,
						},
					},
				],
				as: "distributer",
			},
		},
		{
			$unwind: "$distributer",
		},
		{
			$lookup: {
				from: "superdistributer_users",
				let: { super_distributer_id: "$super_refferal_id" },
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [{ $eq: ["$_id", "$$super_distributer_id"] }],
							},
						},
					},
					{
						$project: {
							cards_16_config: 1,
							user_name: 1,
						},
					},
				],
				as: "super_distributer",
			},
		},
		{
			$unwind: "$super_distributer",
		},
		{
			$project: {
				user_name: 1,
				cards_16_config: 1,
				super_distributer: 1,
				distributer: 1,
			},
		},
	];
	let commisions_info = await GameUser.aggregate(pipeline);
	commisions_info = commisions_info[0];
	csl("add_commission commisions_info : ", commisions_info);

	if (
		typeof commisions_info == "undefined" ||
		commisions_info == "" ||
		commisions_info == null ||
		typeof commisions_info.super_distributer == "undefined" ||
		typeof commisions_info.distributer == "undefined"
	) {
		return 0;
	}

	let super_distri_commission_rate = 0;
	if (
		typeof commisions_info.super_distributer != "undefined" &&
		typeof commisions_info.super_distributer.cards_16_config != "undefined" &&
		typeof commisions_info.super_distributer.cards_16_config.commission !=
			"undefined"
	) {
		super_distri_commission_rate = Number(
			commisions_info.super_distributer.cards_16_config.commission
		);
	}
	let super_distri_commission_amount = Number(
		((play_amount * super_distri_commission_rate) / 100).toFixed(2)
	);
	csl(
		"add_commission super_distri_commission_amount : ",
		super_distri_commission_amount
	);
	if (super_distri_commission_amount > 0) {
		addSuperDistributerWallet(
			commisions_info.super_distributer._id,
			super_distri_commission_amount,
			{
				retailer_id: commisions_info.distributer._id,
				game_type: "roulette_european",
			}
		);
	}
	let distri_commission_rate = 0;
	if (
		typeof commisions_info.distributer != "undefined" &&
		typeof commisions_info.distributer.cards_16_config != "undefined" &&
		typeof commisions_info.distributer.cards_16_config.commission != "undefined"
	) {
		distri_commission_rate = Number(
			commisions_info.distributer.cards_16_config.commission
		);
	}
	let distri_commission_amount = Number(
		((play_amount * distri_commission_rate) / 100).toFixed(2)
	);
	csl("add_commission distri_commission_amount : ", distri_commission_amount);

	if (distri_commission_amount > 0) {
		addDistributerWallet(
			commisions_info.distributer._id,
			distri_commission_amount,
			{
				retailer_id: client._id,
				game_type: "roulette_european",
			}
		);
	}

	let retail_commission_rate = 0;
	if (
		typeof commisions_info.cards_16_config != "undefined" &&
		typeof commisions_info.cards_16_config.commission != "undefined"
	) {
		retail_commission_rate = Number(commisions_info.cards_16_config.commission);
	}

	let retailer_commission_amount = Number(
		((play_amount * retail_commission_rate) / 100).toFixed(2)
	);
	csl(
		"add_commission retailer_commission_amount : ",
		retailer_commission_amount
	);

	if (retailer_commission_amount > 0) {
		addRetailerWallet(commisions_info._id, retailer_commission_amount, {
			retailer_id: commisions_info._id,
			game_type: "roulette_european",
		});
	}

	let total_commission_amount =
		distri_commission_amount +
		retailer_commission_amount +
		super_distri_commission_amount;
	csl("add_commission total_commission_amount : ", total_commission_amount);

	return total_commission_amount;
};
module.exports.claim_tracks = async (amount, client) => {
	let date1 = new Date();
	date1.setSeconds(date1.getSeconds() + Number(19800));
	let date = dateFormat(new Date(date1), "d:mm:yyyy");
	csl("\nclaim_tracks date :: ", date);
	let wh = {
		user_id: client._id,
		game_type: "roulette_european",
		date: date,
	};
	let trackInfo = await Lucky16ReportTracks.findOne(wh, {});
	csl("claim_tracks trackInfo :: ", trackInfo);

	if (trackInfo == null) {
		await Lucky16ReportTracks.create(wh);
	}

	let updateData = {
		$set: {
			user_id: client._id,
			date: date,
		},
		$inc: {
			claim_amount: amount,
		},
	};
	csl("claim_tracks wh , updateData:: ", wh, updateData);

	let upReps = await Lucky16ReportTracks.findOneAndUpdate(wh, updateData, {
		new: true,
	});
	csl("claim_tracks upReps :: ", upReps);

	return true;
};
module.exports.unclaim_tracks = async (amount, client) => {
	let date1 = new Date();
	date1.setSeconds(date1.getSeconds() + Number(19800));
	let date = dateFormat(new Date(date1), "d:mm:yyyy");
	csl("\nunclaim_tracks date :: ", date);
	let wh = {
		user_id: client._id,
		game_type: "roulette_european",
		date: date,
	};
	let trackInfo = await Lucky16ReportTracks.findOne(wh, {});
	csl("unclaim_tracks trackInfo :: ", trackInfo);

	if (trackInfo == null) {
		await Lucky16ReportTracks.create(wh);
	}

	let updateData = {
		$set: {
			user_id: client._id,
			date: date,
		},
		$inc: {
			unclaim_amount: amount,
		},
	};
	csl("unclaim_tracks wh , updateData:: ", wh, updateData);

	let upReps = await Lucky16ReportTracks.findOneAndUpdate(wh, updateData, {
		new: true,
	});
	csl("unclaim_tracks upReps :: ", upReps);

	return true;
};
