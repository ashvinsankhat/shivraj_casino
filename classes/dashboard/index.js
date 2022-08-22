const {
    getPointRummyBetList,
    getPoolRummyBetList,
    getDealRummyBetList
} = require("./rummyBetList");

const {
    getLeaderboard
} = require("./leaderboard");

const {
    getTransactionHistory
} = require("./transaction_history");

module.exports = {
    getPointRummyBetList : getPointRummyBetList,
    getPoolRummyBetList : getPoolRummyBetList,
    getDealRummyBetList : getDealRummyBetList,
    getLeaderboard : getLeaderboard,
    getTransactionHistory : getTransactionHistory
}