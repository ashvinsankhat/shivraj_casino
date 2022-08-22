const {
    getUserInfo,
} = require("./getInfo");
const {
    processRequest,
    cancelRequest,
    successPayment
} = require("./requestHandle");

module.exports = {
    getUserInfo : getUserInfo,
    processRequest : processRequest,
    cancelRequest : cancelRequest,
    successPayment : successPayment
}