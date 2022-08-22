module.exports.getUserInfo = async(requestData, client) => {
    try{
        
        if(typeof client.deposit_details != "undefined" && client.deposit_details) return false;
            client.deposit_details = true;

        let wh = {
            _id : client._id
        }
        let project = {
            display_user_name : 1, 
            profile_url : 1,
            chips : 1, 
            game_winning : 1
        }
        csl("getUserInfo wh , project 1: ", wh, project);
        
        let userInfos = await GameUser.findOne(wh, project);
        csl("getUserInfo userInfos : ", userInfos);

        let slots = [1000,500,200,100,50];
        
        let response = {
            slots : slots,
            chips : userInfos.chips,
            game_winning : userInfos.game_winning,
            display_user_name : userInfos.display_user_name,
        }
        csl("getUserInfo response: ", response);
        respSendActions.SendDataToUser(client, 'DEPOSIT_DETAILS', response);
        
        delete client.deposit_details;

    }catch(e){
        console.log("Exception getUserInfo : ", e);
        delete client.deposit_details;
    }
}