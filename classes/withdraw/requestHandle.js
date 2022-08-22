const {
    deductWallet,
    addWallet
} = require("./wallet");

const {
    getUserInfo
} = require("./getInfo");

module.exports.placeRequest = async(requestData, client) => {
    try{

        if(typeof client._id == "undefined"){
            return respSendActions.SendDataToUser(client, 'PLACE_WITHDRAW_REQUEST', requestData , true, "1000" , "User session not set, please restart game!", "Error!");
        }
        if(typeof client.withdraw_place != "undefined" && client.withdraw_place) return false;
        client.withdraw_place = true;
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
        csl("placeRequest wh , project: ", wh, project);

        let userInfos = await GameUser.findOne(wh, project);
        csl("placeRequest userInfos : ", userInfos);

        if(typeof requestData.amount == "undefined" || (typeof requestData.amount != "undefined" && Number(requestData.amount) > Number(userInfos.game_winning) )){
            delete client.withdraw_place
            return respSendActions.SendDataToUser(client, 'PLACE_WITHDRAW_REQUEST', requestData , true, "7001" , "Please enter proper amount!", "Error!");
        }
        
        if(typeof requestData.amount == "undefined" || (typeof requestData.amount != "undefined" && Number(requestData.amount) > Number(userInfos.game_winning) )){
            delete client.withdraw_place
            return respSendActions.SendDataToUser(client, 'PLACE_WITHDRAW_REQUEST', requestData , true, "7001" , "Please enter proper amount!", "Error!");
        }
        
        let withdraw_id = "WITHDRAW_"+ Date.now();
        let amount = await deductWallet(client._id, -Number(requestData.amount) , 3, "withdraw", {
            withdraw_id : withdraw_id
        })
        csl("placeRequest amount : ", amount);
        if(amount == 0){
            delete client.withdraw_place
            return respSendActions.SendDataToUser(client, 'PLACE_WITHDRAW_REQUEST', requestData , true, "7002" , "Issue when place withdraw request!", "Error!");
        }

        let withdrawTrack = {
            user_id       : wh._id.toString(),
            withdraw_id : withdraw_id,
            trnx_amount   : requestData.amount,
            status  : "pending",
            name    : requestData.name || "",
            ifsc    : requestData.ifsc || "",
            accno   : requestData.accno || "",
            mobile  : requestData.mobile || "",
            upi     : requestData.upi || "",
        }
        let track = await WithdrawTracks.create(withdrawTrack)
        csl("placeRequest track : ", track);
        
        respSendActions.SendDataToUser(client, 'PLACE_WITHDRAW_REQUEST', {
            done : true
        });

        await getUserInfo(requestData, client);
        delete client.withdraw_place
    }catch(e){
        console.log("Exception updateProfile : ", e);
        delete client.withdraw_place
    }
}
module.exports.cancelRequest = async(requestData, client) => {
    try{

        if(typeof client._id == "undefined"){
            return respSendActions.SendDataToUidDirect(client._id, 'CANCEL_WITHDRAW_REQUEST', requestData , true, "1000" , "User session not set, please restart game!", "Error!");
        }
        if(typeof client.withdraw_cancel != "undefined" && client.withdraw_cancel) return false;
        client.withdraw_cancel = true;
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
        csl("cancelRequest wh , project: ", wh, project);

        let userInfos = await GameUser.findOne(wh, project);
        csl("cancelRequest userInfos : ", userInfos);

        if(typeof requestData.wid == "undefined"){
            delete client.withdraw_cancel
            return respSendActions.SendDataToUidDirect(client._id, 'CANCEL_WITHDRAW_REQUEST', requestData , true, "7003" , "Please select proper withdraw request!", "Error!");
        }

        let wh1 = {
            _id : requestData.wid,
            status : "pending"
        }
        csl("cancelRequest wh1 : ", wh1);

        let withdrawInfo = await WithdrawTracks.findOne(wh1, {});
        csl("cancelRequest withdrawInfo : ", withdrawInfo);
        
        if(withdrawInfo == null){
            delete client.withdraw_cancel
            return respSendActions.SendDataToUidDirect(client._id, 'CANCEL_WITHDRAW_REQUEST', requestData , true, "7004" , "withdraw request not found!", "Error!");
        }
        let amount = await addWallet(client._id, Number(withdrawInfo.trnx_amount) , 4, "cancel withdraw", withdrawInfo)
        let updateData = {
            $set : {
                status : "cancel"
            }
        }
        let depositInfos = await WithdrawTracks.findOneAndUpdate(wh1, updateData, {new: true});
        csl("cancelRequest depositInfos : ", depositInfos);

        respSendActions.SendDataToUidDirect(client._id,  'CANCEL_WITHDRAW_REQUEST', {
            done : true
        });
        delete client.withdraw_cancel;

    }catch(e){
        console.log("Exception updateProfile : ", e);
    }
}