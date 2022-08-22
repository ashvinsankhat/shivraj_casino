const signupActions = require("./signup");

module.exports.AppLunchDetails = async(requestData, client) => {
    try{
        
        // if(typeof requestData.mobile_number == 'undefined'){
        //     csl("Please enter alid signup details.................!")
        //     return false
        // }

        let user_name = requestData.user_name;//(requestData.mobile_number.indexOf("-") != -1)?requestData.mobile_number.split("-")[1]:requestData.mobile_number;
        // if((mobileNumberTemp.length < 10 || mobileNumberTemp == "")){
        //     respSendActions.SendDataToUser(client, "AppLunchDetails", requestData, true, "0002", "Enter Valid mobile Number!", "Error!");
        //     return false;
        // }

        let redis = await redisClass.setnx('AppLunchDetails:'+user_name, 1, 15);
        csl("\nappLunchDetail redis : ",redis);
       
        if (redis == 0)
            return false;
        
        await signupActions.appLunchDetail(requestData, client);

        redisClass.del('AppLunchDetails:' + user_name.toString());
        return false;
    }catch(e){
        console.log("Exception AppLunchDetails ::", e);
    }
}
module.exports.CMN = async(requestData, client) => {
    try {			
        csl("CMN requestData ::",requestData);
       
        let mobileNumberTemp = (requestData.mobile_number.indexOf("-") != -1)?requestData.mobile_number.split("-")[1]:requestData.mobile_number;
        csl("CMN wh ::", mobileNumberTemp);

        if(typeof mobileNumberTemp == "undefined" || ((mobileNumberTemp.length < 10 || mobileNumberTemp == ""))){
            csl("CMN  : Please enter valid number..........!");
            respSendActions.SendDataToUser(client, "CMN", requestData, true, "0002", "Enter Valid mobile Number!", "Error!");
            return false;
        }
        await signupActions.checkMobileNumber(requestData, client);

        return false;
    }catch (e) {
        console.log("Exception CMN ::",e)
    }
}
module.exports.CRC = async(requestData, client) => {
    try{
        await signupActions.checkReferalOrCouponCode(requestData, client);

        return false;
    }catch(e){
        console.log("Exception CRC : ", e);
    }
}
module.exports.LOGIN = async(requestData, client) => {
    try{
        csl("LOGIN call :", requestData);
        let mobileNumberTemp = (requestData.mobile_number.indexOf("-") != -1)?requestData.mobile_number.split("-")[1]:requestData.mobile_number;

        if((mobileNumberTemp.length < 10 || mobileNumberTemp == "")){
            csl("LOGIN  : Please enter valid number..........!");
            return respSendActions.SendDataToUser(client,'LOGIN', requestData , true, "0002", "Enter Valid mobile Number!", "Error!");
        }

        let redis = await redisClass.setnx('LOGIN:'+mobileNumberTemp, 1, 15);
        csl("\nLOGIN redis : ",redis);
       
        if (redis == 0)
            return false;

        await signupActions.userLogin(requestData, client);

        redisClass.del('LOGIN:' + mobileNumberTemp.toString());
        return true;
    }catch (e) {
        console.log("Exception oldUserLogin : 1 ::",e);
    }
}
module.exports.SIGNUP = async(requestData, client) => {
    try{
        csl("SIGNUP call :", requestData);
        let mobileNumberTemp = requestData.mobile_number;

        if((mobileNumberTemp.length < 10 || mobileNumberTemp == "")){
            csl("SIGNUP  : Please enter valid number..........!");
            return respSendActions.SendDataToUser(client,'SIGNUP', requestData , true, "0002", "Enter Valid mobile Number!", "Error!");
        }

        let redis = await redisClass.setnx('SIGNUP:'+mobileNumberTemp, 1, 15);
        csl("\nSIGNUP redis : ",redis);
       
        if (redis == 0)
            return false;

        await signupActions.userSignup(requestData, client);

        redisClass.del('SIGNUP:' + mobileNumberTemp.toString());
        return true;        
    }catch (e) {
        console.log("Exception oldUserLogin : 1 ::",e);
    }
}
module.exports.VOTP = async(requestData, client) => {
    try{
        csl("VOTP call :", requestData);
        let mobileNumberRd = requestData.mobile_number;

        let redis = await redisClass.setnx('VOTP:'+mobileNumberRd.toString(), 1, 10);
        csl("VOTP redis : ",redis);
        if (redis == 0)
            return false;

        await signupActions.verifyOTP(requestData, client);

        redisClass.del('VOTP:' +mobileNumberRd.toString());

        return true;        
    }catch (e) {
        console.log("Exception VOTP : 1 ::",e);
    }
}
module.exports.ROTP = async(requestData, client) => {
    try{
        csl("\nROTP call :: ",requestData);
        let mobileNumberTemp = requestData.mobile_number;
        csl("ROTP wh ::", mobileNumberTemp);

        if((mobileNumberTemp.length < 10 || mobileNumberTemp == "")){
            csl("ROTP Please enter valid number..........!");
            respSendActions.SendDataToUser(client, "ROTP", requestData, true, "0002", "Enter Valid mobile Number!", "Error!");
            return false;
        }

        let redis = await redisClass.setnx('ROTP:'+mobileNumberTemp.toString(), 1, 10);
        csl("ROTP redis : ",redis);
        if (redis == 0)
            return false;

        await signupActions.resendOTP(requestData, client);

        redisClass.del('ROTP:' +mobileNumberTemp.toString());
        return true;        
    }catch (e) {
        console.log("Exception ROTP : 1 ::",e);
    }
}