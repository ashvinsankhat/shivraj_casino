const urlencode = require('urlencode');
const rq = require('request');
module.exports.sendOTP = async(data,client) => {
    try{
        csl("sendOTP call ::",new Date(),data);
        let otp = commonClass.GetRandomInt(111111, 999999);
        // let tempMobile =  data.mobile_number;
        let tempMobile = (data.mobile_number.indexOf("-") != -1)?data.mobile_number.split("-")[1]:data.mobile_number;
        splitNo6 = tempMobile.substring(0, 6);
        splitNo5 = tempMobile.substring(0, 5);
        csl("sendOTP tempMobile ::",tempMobile);

        // if(splitNo6.trim() == "000000" || splitNo5.trim() == "00000" || config.TEST_MOBILE_NO.indexOf( tempMobile) != -1){
            otp = 166549
        // }c
        const up = {
            $set: {
                mobile_number : tempMobile,
                otp : otp,
                code_verify : false
            }
        }
        if(typeof data.new_user != "undefined" && data.new_user){
            up["$set"]["refer_code"] = data.refer_code || ""
            up["$set"]["new_user"] = (typeof data.new_user != "undefined" && data.new_user)?true:false
        }
        csl("sendOTP up :: ",up);

        let wh = {
            mobile_number : tempMobile.toString()
        }
        
        let otpDetails = await UserOtp.findOneAndUpdate(
            wh, 
            up,
            {
                upsert : true ,
                new : true
            }
        ).lean();
        csl("sendOTP otpDetails :",otpDetails);
        
        otpDetails["SampleOTP"] = otpDetails.otp;
        // let smsSend = await publishSMS(otpDetails,client);
        return otpDetails;
    } catch(e) {
        csl("sendOTP Exception : 1 ::",e)
        return false;
    }
}
getTemplatesNew = async(smsDetail,client) => {
    let tempWh = {
        "templateName": smsDetail.title
    }
    let tempInfo = await dbOperClass.findOne('sms_templates', tempWh, {}, {}, 0, 0); 
    if(tempInfo != null){
        return tempInfo.msg;
    }else{
        return '';
    }                
}
keywordReplacer = async(dt, str) => {
    //dt : total subset of array keyword.
    //str : in which string you want to replace keyword.
    for(var y in dt){  eval("str = str.replace(/\\[\\["+y+"]\\]/g, dt."+y+");"); }
    // for(var z in config){  eval("str = str.replace(/\\[\\["+z+"]\\]/g, config."+z+");"); }
    
    return str;
}
publishSMS = async(smsDetail,client) => {
    csl("sendSMSNew smsDetail :: ",smsDetail);

    return new Promise((resolve,reject)=>{
        
        const req = unirest("POST", config.FASTSMS.URL);

        req.headers({
            "authorization": config.FASTSMS.API_KEY
        });

        req.form({
            "sender_id": config.FASTSMS.SENDER_ID,
            "message": "137174",
            "variables_values": smsDetail.SampleOTP,
            "route": "dlt",
            "numbers": smsDetail.mobile_number,
        });

        req.end(function (res) {
            if (res.error)  resolve(false);

            resolve(true);
        });
    })
}