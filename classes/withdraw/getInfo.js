module.exports.getUserInfo = async(reqestData, client) => {
    try{
        let wh = {
            _id : client._id
        }
        let project = {
            display_user_name : 1, 
            profile_url : 1,
            chips : 1, 
            game_winning : 1,
            // counters : 1
        }
        csl("getUserInfo wh , project: ", wh, project);
        
        let userInfos = await GameUser.findOne(wh, project);
        csl("getUserInfo userInfos : ", userInfos);
        let wh1 = {
            user_id : client._id
        }
        let project1 = {
            
        }
        csl("getUserInfo wh , project: ", wh1, project1);
        let accountInfo = await AccountDetails.findOne(wh1, project1);
        csl("getUserInfo accountInfo : ", accountInfo);
        if(accountInfo == null){
            accountInfo = {
                user_id : client._id,
                adhar_url : "",
                adhar_status : false,
                pan_url : "",
                pan_status : false,
                name : "",
                ifsc : "",
                accno : "",
                mobile : "",
                upi : "",
                reason : ""
            }
        }
        csl("getUserInfo accountInfo : ", accountInfo);

        let response = {
            userInfos : userInfos,
            accountInfo : accountInfo
        }
        respSendActions.SendDataToUser(client, 'WITHDRAW_DETAILS', response);

    }catch(e){
        console.log("Exception getUserInfo : ", e);
    }
}