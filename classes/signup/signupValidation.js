const smsActions = require("../sms");

module.exports.checkMobileNumber = async(requestData, client) => {
    if(typeof requestData.type != "undefined" && requestData.type == "signup"){
        let wh = {
            mobile_number : requestData.mobile_number
        };
        csl("CMN wh ::", wh);
       
        let resp = await GameUser.findOne( wh, {id:1,_id:1});
        csl("CMN resp ::", resp);

        if(resp != null ){
            respSendActions.SendDataToUser(client, "CMN", requestData, true, "0003", "Mobile Number already exists!", "Error!");
        }else{
            respSendActions.SendDataToUser(client, "CMN", {valid:true});
        }
    }else if(typeof requestData.type != "undefined" && requestData.type == "login"){
        let wh = {
            mobile_number : requestData.mobile_number
        };
        csl("CMN wh ::", wh);
        
        let resp = await GameUser.findOne( wh, {id:1,_id:1});
        csl("CMN resp ::", resp);

        if(resp == null ){
            respSendActions.SendDataToUser(client, "CMN", requestData, true, "0004", "Mobile Number not register!", "Error!");
        }else{
            respSendActions.SendDataToUser(client, "CMN", {valid:true});
        }
    }else {
        respSendActions.SendDataToUser(client, "CMN", requestData, true, "0002", "Enter Valid mobile Number!", "Error!");
    }
    return true
}
module.exports.checkReferalOrCouponCode = async(requestData, client) => {
    if(requestData.code.length != 0 && requestData.code.length <= 10 ){
        let wh = {
            rfc : requestData.code.toLowerCase()
        }
        let resp = await GameUser.findOne( wh, {id:1,_id:1});
        csl("CRC resp ::",resp);
        if(resp != null){
            respSendActions.SendDataToUser(client, "CRC", {valid : true, msg : "Congrats! Referral Code Valid"});
        }else{
            respSendActions.SendDataToUser(client, "CRC", requestData, true, "0005", "Enter valid referral!", "Error!");
        }
    }else{
        respSendActions.SendDataToUser(client, "CRC", requestData, true, "0005", "Enter valid referral!", "Error!");
    }
    return true
}
module.exports.userLogin = async(requestData, client) => {

    let wh = { 
        mobile_number : requestData.mobile_number
    }
    csl("F wh :", wh)
    
    let resp = await GameUser.findOne( wh, {id:1,_id:1})
    csl("LOGIN resp :", resp);

    if(resp != null){
        let otpsend =  await smsActions.sendOTP(requestData, client);
        csl("LOGIN Otp Send :: ",JSON.stringify(otpsend));

        respSendActions.SendDataToUser(client,'LOGIN', { mobile_number : requestData.mobile_number, status : true});
    }else{
        respSendActions.SendDataToUser(client, "LOGIN", requestData, true, "0004", "Mobile Number not register!", "Error!");
    }
    return true;

}
module.exports.userSignup = async(requestData, client) => {

    let wh = { 
        mobile_number : requestData.mobile_number
    }
    csl("userSignup wh :", wh)
    
    let resp = await GameUser.findOne( wh, {id:1,_id:1})
    csl("userSignup resp :", resp);

    if(resp == null){
        requestData.new_user = true;
        let otpsend =  await smsActions.sendOTP(requestData, client);
        csl("userSignup Otp Send :: ",JSON.stringify(otpsend));
        
        respSendActions.SendDataToUser(client,'SIGNUP', { mobile_number : requestData.mobile_number, status : true});
    }else{
        respSendActions.SendDataToUser(client, "SIGNUP", requestData, true, "0005", "Mobile Number already register!", "Error!");
    }    
    return true;
}
module.exports.verifyOTP = async(requestData, client) => {

    let mobileNumberRd = requestData.mobile_number;

    let wh = {
        mobile_number : mobileNumberRd,
        otp : Number(requestData.otp),
        code_verify : false
    };
    let otp_data = await UserOtp.findOne( wh, {});
    csl("\nverifyOTP otp_data : ", wh, otp_data);
    
    if (otp_data != null) {
        
        await UserOtp.updateOne( {
            _id : otp_data._id
        }, { 
            $set : {
                code_verify : true
            }
        },{});
        requestData.code_verify = true;
        respSendActions.SendDataToUser(client, 'VOTP', requestData);		
        				
    } else {
        respSendActions.SendDataToUser(client,'VOTP', requestData , true, "0007" , "Incorrect OTP", "Error!");
    }
    return true;
}
module.exports.resendOTP = async(requestData, client) => {
    
    let mobileNumberRd = requestData.mobile_number;
    let wh = {
        mobile_number : mobileNumberRd,
        code_verify : false
    };
    let otp_data = await UserOtp.findOne( wh, {});
    csl("\nresendOTP otp_data : ", wh, otp_data);
    
    if (otp_data != null) {
        requestData.reSend = true;
        await smsActions.sendOTP(requestData, client);
        respSendActions.SendDataToUser(client, "ROTP", { mobile_number : requestData.mobile_number , status : true});
    }else{
        respSendActions.SendDataToUser(client, "ROTP", requestData, true, "0002", "Enter Valid mobile Number!", "Error!");
    }
    return true;
}