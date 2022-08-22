module.exports.getSignupBonus = async(reqestData) => {
    let bonusData = {
        "code"  : (reqestData.refer_code)?"SIGNUP_"+refer_code:"WELCOME_GPL",
        "expaireDay" : 15,
        "otc": (reqestData.deviceCounter < 5)? 200000 : 0
    }
    return bonusData;
}