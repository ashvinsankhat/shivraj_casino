const dashboardActions = require("./dashboard");

module.exports.Rummy_PointsBetList = async(requestData, client) => {
    try{
        
        if(typeof client._id == "undefined")
            return respSendActions.SendDataToUser(client, 'Rummy_PointsBetList', requestData , true, "1000" , "User session not set, please restart game!", "Error!");

        let rcKey = "Rummy_PointsBetList:"+ client._id.toString();
        let rcRadis = await redisClass.setnx(rcKey, 1, 45);
        if (rcRadis == 0){
            csl("Rummy_PointsBetList rcRadis : ", rcRadis);
            return false
        }

        await dashboardActions.getPointRummyBetList(requestData, client);
        
        redisClass.del(rcKey);
        return true;
    }catch(e){
        console.log("Exception Rummy_PointsBetList :",e);
    }
}
module.exports.Rummy_PoolBetList = async(requestData, client) => {
    try{
        
        if(typeof client._id == "undefined")
            return respSendActions.SendDataToUser(client, 'Rummy_PoolBetList', requestData , true, "1000" , "User session not set, please restart game!", "Error!");

        let rcKey = "Rummy_PoolBetList:"+ client._id.toString();
        let rcRadis = await redisClass.setnx(rcKey, 1, 45);
        if (rcRadis == 0){
            csl("Rummy_PoolBetList rcRadis : ", rcRadis);
            return false
        }

        await dashboardActions.getPoolRummyBetList(requestData, client);
        
        redisClass.del(rcKey);
        return true;
    }catch(e){
        console.log("Exception Rummy_PoolBetList :",e);
    }
}
module.exports.Rummy_DealBetList = async(requestData, client) => {
    try{
        
        if(typeof client._id == "undefined")
            return respSendActions.SendDataToUser(client, 'Rummy_DealBetList', requestData , true, "1000" , "User session not set, please restart game!", "Error!");

        let rcKey = "Rummy_DealBetList:"+ client._id.toString();
        let rcRadis = await redisClass.setnx(rcKey, 1, 45);
        if (rcRadis == 0){
            csl("Rummy_DealBetList rcRadis : ", rcRadis);
            return false
        }

        await dashboardActions.getDealRummyBetList(requestData, client);
        
        redisClass.del(rcKey);
        return true;
    }catch(e){
        console.log("Exception Rummy_DealBetList :",e);
    }
}