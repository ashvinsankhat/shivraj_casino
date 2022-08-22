const {
    getUserInfo,
} = require("./getInfo");
const {
    placeRequest,
    cancelRequest
} = require("./requestHandle");

module.exports = {
    getUserInfo : getUserInfo,
    placeRequest : placeRequest,
    cancelRequest : cancelRequest
}