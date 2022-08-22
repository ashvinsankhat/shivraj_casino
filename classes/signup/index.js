const {
    appLunchDetail
} = require("./appStartDetails");

const {
    checkMobileNumber,
    checkReferalOrCouponCode,
    userLogin,
    userSignup,
    verifyOTP,
    resendOTP
} = require("./signupValidation");


module.exports = {
    appLunchDetail    : appLunchDetail,
    checkMobileNumber : checkMobileNumber,
    checkReferalOrCouponCode : checkReferalOrCouponCode,
    userLogin : userLogin,
    userSignup : userSignup,
    verifyOTP : verifyOTP,
    resendOTP : resendOTP
}