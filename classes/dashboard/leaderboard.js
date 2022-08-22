module.exports.getLeaderboard = async(reqestData, client) => {
    try{
        let wh = {
        }
        let project = {
            display_user_name : 1, 
            profile_url : 1,
            chips : 1, 
        }
        let userLisst = await GameUser.find(wh, project).sort({chips:-1}).limit(10);
        csl("getProfileInfo userLisst : ", userLisst);

        respSendActions.SendDataToUser(client,'LEADERBOARD', {
            lists : userLisst
        });
    }catch(e){
        console.log("Exception getProfileInfo : ", e);
    }
}