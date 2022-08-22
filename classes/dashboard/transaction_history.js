module.exports.getTransactionHistory = async(requestData, client) => {
    try{
        let type = "All"
        if(typeof requestData.type != "undefined"){
            type = requestData.type
        }
        if(type == "All"){
            let wh = {
                user_id : client._id
            }
            let project = {
                trnx_type_txt : 1,
                trnx_amount  : 1, 
                game_id : 1, 
                deposit_id : 1,
                withdraw_id : 1,
            }
            let historys = await UserWalletTracks.find(wh, project).sort({_id : -1}).limit(20);

            respSendActions.SendDataToUser(client,'TRANSACTIONS', {
                type : type,
                lists : historys
            });
        }else if(type == "withdraw"){
            let wh = {
                user_id : client._id
            }
            let project = {
                withdraw_id : 1,
                trnx_amount  : 1, 
                status : 1, 
            }
            let historys = await WithdrawTracks.find(wh, project).sort({_id : -1}).limit(20);

            respSendActions.SendDataToUser(client,'TRANSACTIONS', {
                type : type,
                lists : historys
            });
        }else if(type == "deposit"){
            let wh = {
                user_id : client._id,
                status : "complete"
            }
            let project = {
                deposit_id : 1,
                trnx_amount  : 1, 
                status : 1, 
            }
            let historys = await DepositTracks.find(wh, project).sort({_id : -1}).limit(20);

            respSendActions.SendDataToUser(client, 'TRANSACTIONS', {
                type : type,
                lists : historys
            });
        }
        
    }catch(e){
        console.log("Exception getProfileInfo : ", e);
    }
}