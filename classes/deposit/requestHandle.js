const {
    addWallet
} = require("./wallet");

const {
    getUserInfo
} = require("./getInfo");
const slots = [1000,500,200,100,50,5,1];

module.exports.processRequest = async(requestData, client) => {
    try{

        if(typeof client._id == "undefined"){
            return respSendActions.SendDataToUser(client, 'PROCESS_DEPOSIT_REQUEST', requestData , true, "1000" , "User session not set, please restart game!", "Error!");
        }
        let wh = {
            _id : client._id
        }
        let project = {
            display_user_name : 1, 
            profile_url : 1,
            chips : 1, 
            game_winning : 1,
            counters : 1,
            mobile_number :1
        }
        csl("processRequest wh , project: ", wh, project);

        let userInfos = await GameUser.findOne(wh, project);
        csl("processRequest userInfos : ", userInfos);

        if(typeof requestData.amount == "undefined" || (typeof requestData.amount != "undefined" && Number(requestData.amount) < Number(slots[slots.length-1]) )){
            return respSendActions.SendDataToUser(client, 'PROCESS_DEPOSIT_REQUEST', requestData , true, "7001" , "Please enter proper amount!", "Error!");
        }
        
        let deposit_id = "DEPOSIT_"+ Date.now();
        let paramarray = {};

        paramarray['appId'] = config.CASH_FREE.APP_ID;
        paramarray['orderId'] = deposit_id; 
        paramarray['orderCurrency'] = "INR";
        paramarray['orderAmount'] =  Number(requestData.amount);
        paramarray['orderNote'] = "Add in Game Wallet Coins";
        paramarray['customerName'] =(userInfos.display_user_name)?userInfos.display_user_name:"Temp123";
        paramarray['customerPhone'] = (userInfos.mobile_number)?userInfos.mobile_number:"9898989898";
        paramarray['customerEmail'] = "abc@gmail.com"
        paramarray['notifyUrl'] =  "http://13.127.218.205:3000/cashFreeNotify";

        const tokenDetails = await this.cashFreeTokenGenarate(paramarray);
        if(typeof tokenDetails.status != "undefined" && typeof tokenDetails.cftoken != "undefined" && tokenDetails.status == "OK" ){
					
            let response = {
                deposit_id  : deposit_id,
                user_id     : client._id.toString(),
                trnx_amount : requestData.amount,
                status      : "pending",
            }

            let track = await DepositTracks.create(response)
            csl("processRequest track : ", track);
           
            paramarray["status"] = "PENDING";
            paramarray["cd"] = new Date();
            paramarray["UserId"] = client._id.toString();
            
            paramarray["stage"] = config.CASH_FREE.ENV;
            paramarray["token"] = tokenDetails.cftoken;
           
            csl("processRequest response : ", response);
            
            respSendActions.SendDataToUser(client, 'PROCESS_DEPOSIT_REQUEST', paramarray);

        }else{
            csl("processRequest tokenDetails : ",JSON.stringify(tokenDetails));
            csl("processRequest paramarray : ",JSON.stringify(paramarray));
            return respSendActions.SendDataToUser(client, 'PROCESS_DEPOSIT_REQUEST', requestData , true, "7002" , "Issue in generate token, Please try after some time!", "Error!");
        }
        
    }catch(e){
        console.log("Exception processRequest : ", e);
    }
}
module.exports.successPayment = async(requestData, client) => {
    try{

        if(typeof client._id == "undefined"){
            return respSendActions.SendDataToUidDirect(client._id, 'SUCCESS_PAYMENT_REQUEST', requestData , true, "1000" , "User session not set, please restart game!", "Error!");
        }
        if (data.txStatus == 'SUCCESS' && client._id) {
            let wh = {
                _id : client._id
            }
            let project = {
                display_user_name : 1, 
                profile_url : 1,
                chips : 1, 
                game_winning : 1,
                counters : 1
            }
            csl("saccessPayment wh , project: ", wh, project);

            let userInfos = await GameUser.findOne(wh, project);
            csl("saccessPayment userInfos : ", userInfos);

            if(typeof requestData.wid == "undefined"){
                return respSendActions.SendDataToUidDirect(client._id, 'SUCCESS_PAYMENT_REQUEST', requestData , true, "7003" , "Please select proper withdraw request!", "Error!");
            }

            let wh1 = {
                user_id : client._id,
                deposit_id : requestData.deposit_id,
                status : "pending"
            }
            csl("saccessPayment wh1 : ", wh1);

            let depositInfo = await DepositTracks.findOne(wh1, {});
            csl("saccessPayment depositInfo : ", depositInfo);
            
            if(depositInfo == null){
                return respSendActions.SendDataToUidDirect(client._id, 'SUCCESS_PAYMENT_REQUEST', requestData , true, "7004" , "deposit request not found!", "Error!");
            }
            if(depositInfo.status != "pending"){
                return respSendActions.SendDataToUidDirect(client._id, 'SUCCESS_PAYMENT_REQUEST', requestData , true, "7005" , "deposit request not found!", "Error!");
            }

            var cashFreeRes = await this.cashFreePaymentCheck(data);	
            csl("saccessPayment : cashFreeRes :",cashFreeRes);
            if(cashFreeRes == null || typeof cashFreeRes.orderStatus == "undefined" || typeof cashFreeRes.txStatus == "undefined" || typeof cashFreeRes.orderAmount == "undefined" ){
                return respSendActions.SendDataToUidDirect(client._id, 'SUCCESS_PAYMENT_REQUEST', requestData , true, "7006" , "Some error getting to add payment!", "Error!");
            }
            if(cashFreeRes.orderStatus == "PAID" && cashFreeRes.txStatus == "SUCCESS"){
                let updateData = {
                    $set : {
                        status : "complete"
                    }
                }
                let depositInfos = await DepositTracks.findOneAndUpdate(wh1, updateData, {new: true});
                csl("saccessPayment depositInfos : ", depositInfos);

                let amount = await addWallet(client._id, Number(cashFreeRes.orderAmount) , 4, "deposit amount", depositInfo)
                
                respSendActions.SendDataToUidDirect(client._id,  'SUCCESS_PAYMENT_REQUEST', depositInfo);
            }else{
                return respSendActions.SendDataToUidDirect(client._id, 'SUCCESS_PAYMENT_REQUEST', requestData , true, "7006" , "Some error getting to add payment!", "Error!");
            } 
        }else{
            let msg = "Order in "+ data.txStatus;
            return respSendActions.SendDataToUidDirect(client._id, 'SUCCESS_PAYMENT_REQUEST', requestData , true, "8001" ,msg, "Error!");
        }
    }catch(e){
        console.log("Exception successPayment : ", e);
    }

}
module.exports.cashFreeTokenGenarate = async(data) => {
    return new Promise((resolve ,reject)=>{
        try{
            csl("\ncashFreeTokenGenarate : data : ",JSON.stringify(data));
            let fromData = {
                "orderId": data.orderId,
                "orderAmount": data.orderAmount,
                "orderCurrency": data.orderCurrency
            }
            let optionData = {
                'method': 'POST',
                "uri": config.CASH_FREE.URL+"api/v2/cftoken/order",
                'headers': {
                    'x-client-id' : config.CASH_FREE.APP_ID,
                    "x-client-secret" : config.CASH_FREE.SECRET_KEY
                },
                body: JSON.stringify(fromData)
            }
            csl("cashFreeTokenGenarate : optionData------------->",JSON.stringify(optionData));
            rq(optionData,(err, res, body)=>{
                try {
                    csl("cashFreeTokenGenarate : err ------------>", err)
                    csl("cashFreeTokenGenarate : res1.body ------------>", res.body);
                    if(res.body){
                        res.body = JSON.parse(res.body);
                        csl("cashFreeTokenGenarate res.body--------->",res.body)
                        resolve(res.body)
                    }else{
                        resolve({});
                    }
                } catch (e) {
                    csl("cashFreeTokenGenarate : 2 : Exception :",e)
                    resolve({});
                }
            });
        }catch (e) {
            console.log("cashFreeTokenGenarate : 1 : Exception :",e)
            resolve({});
        }
    })
}
module.exports.cashFreePaymentCheck = async(data) => {
    csl("\ncashFreePaymentCheck : data : ",JSON.stringify(data));
    return new Promise((resolve ,reject)=>{
        try{
            let reqData = "appId="+config.CASH_FREE.APP_ID+"&secretKey="+config.CASH_FREE.SECRET_KEY+"&orderId="+data.orderId;
            let optionData = {
                'method': 'POST',
                "uri": config.CASH_FREE.URL+"api/v1/order/info/status?"+reqData,
                'headers': {
                    'cache-control' : "no-cache",
                    'content-type' : "application/x-www-form-urlencoded",
                }
            }
            csl("cashFreePaymentCheck : optionData------------->",JSON.stringify(optionData));
            rq(optionData,(err, res, body)=>{
                try {
                    csl("cashFreePaymentCheck : err ------------>", err)
                    csl("cashFreePaymentCheck : res1.body ------------>", res.body);
                    if(res.body){
                        res.body = JSON.parse(res.body);
                        csl("cashFreePaymentCheck res.body--------->",res.body)
                        resolve(res.body)
                    }else{
                        resolve({});
                    }
                } catch (e) {
                    csl("cashFreePaymentCheck : 2 : Exception :",e)
                    resolve({});
                }
            });
        }catch (e) {
            console.log("cashFreePaymentCheck : 1 : Exception :",e)
            resolve({});
        }
    })
},

module.exports.processRequest_Paytm = async(requestData, client) => {
    try{

        if(typeof client._id == "undefined"){
            return respSendActions.SendDataToUser(client, 'PROCESS_DEPOSIT_REQUEST', requestData , true, "1000" , "User session not set, please restart game!", "Error!");
        }
        let wh = {
            _id : client._id
        }
        let project = {
            display_user_name : 1, 
            profile_url : 1,
            chips : 1, 
            game_winning : 1,
            counters : 1
        }
        csl("processRequest wh , project: ", wh, project);

        let userInfos = await GameUser.findOne(wh, project);
        csl("processRequest userInfos : ", userInfos);

        if(typeof requestData.amount == "undefined" || (typeof requestData.amount != "undefined" && Number(requestData.amount) < Number(slots[slots.length-1]) )){
            return respSendActions.SendDataToUser(client, 'PROCESS_DEPOSIT_REQUEST', requestData , true, "7001" , "Please enter proper amount!", "Error!");
        }
        
        let deposit_id = "DEPOSIT_"+ Date.now();

        var paramarray = {};
        var ORDER_ID = deposit_id;
        
        paramarray['MID'] = config.PAYTM.MID; //Provided by Paytm
        paramarray['ORDER_ID'] = ORDER_ID; //unique OrderId for every request
        paramarray['CUST_ID'] = client._id.toString();  // unique customer identifier 
        paramarray['INDUSTRY_TYPE_ID'] = config.PAYTM.INDUSTRY_TYPE_ID; //Provided by Paytm
        paramarray['CHANNEL_ID'] = config.PAYTM.CHANNEL_ID; //Provided by Paytm
        paramarray['TXN_AMOUNT'] = (requestData.amount) ? requestData.amount.toString() : '1'; // transaction amount
        paramarray['WEBSITE'] =  config.PAYTM.WEBSITE; //Provided by Paytm  "WEBSTAGING" :
        paramarray['CALLBACK_URL'] =  config.PAYTM.CALLBAKURL+"?ORDER_ID="+ORDER_ID; //"https://paytm.com/paytmchecksum/paytmCallback.jsp"; //"https://securegw.paytm.in/theia/paytmCallback?ORDER_ID="+ORDER_ID; //"https://securegw.paytm.in/theia/paytmCallback?ORDER_ID="+paramarray.ORDER_ID;//(data.det && data.det.toLowerCase() == "web") ? "https://new-dev.artoon.in:6047/paytmCallback?ORDER_ID=" + ORDER_ID : config.WALLET_PAYTM_PAYTMCALLBAKURL + "?ORDER_ID=" + ORDER_ID;
        csl("processRequest paramarray :: ", paramarray);

        let checksum = await this.generateCheckSum(paramarray);
        csl("processRequest checksum :: ", checksum);
        if(checksum == ""){
            return respSendActions.SendDataToUser(client, 'PROCESS_DEPOSIT_REQUEST', requestData , true, "7002" , "Issue in checksum Genrate!", "Error!");
        }
        let response = {
            deposit_id : deposit_id,
            user_id : client._id.toString(),
            trnx_amount  : (requestData.amount) ? requestData.amount.toString() : '1',
            checksum : checksum,
            status   : "pending",
            method    : "Paytm"
        }

        let track = await DepositTracks.create(response)
        csl("processRequest track : ", track);
        response.redirect_url = config.PAYTM.URL;
        respSendActions.SendDataToUser(client, 'PROCESS_DEPOSIT_REQUEST', response);

    }catch(e){
        console.log("Exception processRequest : ", e);
    }
}
module.exports.successPayment_Paytm = async(requestData, client) => {
    try{

        if(typeof client._id == "undefined"){
            return respSendActions.SendDataToUidDirect(client._id, 'SUCCESS_PAYMENT_REQUEST', requestData , true, "1000" , "User session not set, please restart game!", "Error!");
        }
        let wh = {
            _id : client._id
        }
        let project = {
            display_user_name : 1, 
            profile_url : 1,
            chips : 1, 
            game_winning : 1,
            counters : 1
        }
        csl("saccessPayment wh , project: ", wh, project);

        let userInfos = await GameUser.findOne(wh, project);
        csl("saccessPayment userInfos : ", userInfos);

        if(typeof requestData.wid == "undefined"){
            return respSendActions.SendDataToUidDirect(client._id, 'SUCCESS_PAYMENT_REQUEST', requestData , true, "7003" , "Please select proper withdraw request!", "Error!");
        }

        let wh1 = {
            deposit_id : requestData.deposit_id,
            status : "pending"
        }
        csl("saccessPayment wh1 : ", wh1);

        let depositInfo = await DepositTracks.findOne(wh1, {});
        csl("saccessPayment depositInfo : ", depositInfo);
        
        if(depositInfo == null){
            return respSendActions.SendDataToUidDirect(client._id, 'SUCCESS_PAYMENT_REQUEST', requestData , true, "7004" , "deposit request not found!", "Error!");
        }
        if(depositInfo.status != "pending"){
            return respSendActions.SendDataToUidDirect(client._id, 'SUCCESS_PAYMENT_REQUEST', requestData , true, "7005" , "deposit request not found!", "Error!");
        }

        var paramarray = {};
        paramarray['MID'] = config.PAYTM.MID; //Provided by Paytm
        paramarray['ORDERID'] = depositInfo.deposit_id; //unique OrderId for every request
        
        let checksum = await this.generateCheckSum(paramarray);
        csl("saccessPayment checksum :: ", checksum);
        if(checksum == ""){
            return respSendActions.SendDataToUser(client, 'SUCCESS_PAYMENT_REQUEST', requestData , true, "7002" , "Issue in checksum Genrate!", "Error!");
        }

        let check_transactions = await this.checkPayment(checksum);
        if(check_transactions.STATUS == "TXN_SUCCESS"){
            let updateData = {
                $set : {
                    status : "complete"
                }
            }
            let depositInfos = await DepositTracks.findOneAndUpdate(wh1, updateData, {new: true});
            csl("saccessPayment depositInfos : ", depositInfos);

            let amount = await addWallet(client._id, Number(requestData.trnx_amount) , 4, "deposit amount", depositInfo)
            
            respSendActions.SendDataToUidDirect(client._id,  'SUCCESS_PAYMENT_REQUEST', depositInfo);
        }else{
            return respSendActions.SendDataToUser(client, 'SUCCESS_PAYMENT_REQUEST', requestData , true, "7002" , "Issue in payment!", "Error!");
        }
        

    }catch(e){
        console.log("Exception updateProfile : ", e);
    }
}
module.exports.generateCheckSum = async(paramarray) => {
    
    return new Promise((resolve, reject)=>{
        checksum_lib.genchecksum(paramarray, config.PAYTM.MERCHANT_KEY, function (err, response) {
            if(err){
                resolve("")
            }
            resolve(response);
        })
    })
}
module.exports.checkPayment = async(JsonData) => {
    return new Promise((resolve, reject)=>{
        let finalstring = "JsonData=" + JSON.stringify(JsonData);
        request({
            url: config.PAYTM.STATUS_URL+'?' + finalstring,
            method: 'POST'
        }, function (error, response, body) {
            if(error){
                resolve("")
            }
            body = JSON.parse(body);
            resolve(body);
        })
    })
}