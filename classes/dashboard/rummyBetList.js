module.exports.getPointRummyBetList = async(requestData, client) => {
    
    console.log("getPointRummyBetList requestData : ", requestData);

    let wh = {
        game_type : requestData.game_type,
        sub_type  : requestData.sub_type,
        is_active : true
    }
    if(typeof requestData.max_seat != "undefined")
        wh["max_seat"] = ([2,6].indexOf(Number(requestData.max_seat)) != -1)?Number(requestData.max_seat) : 2
    
   
    csl("getPointRummyBetList wh, project : ", wh);

    let betList = await BetLists.aggregate([
        {
            $match : wh
        },{
            $project : {
                bet_id : "$_id",
                _id: 0 ,
                bet_value : "$bet_value",
                max_seat : 1,
                sub_type : 1
            }
        }
    ]);
    csl("getPointRummyBetList betList : ", betList);

    let response = {
        betList : betList
    }
    respSendActions.SendDataToUser(client, 'Rummy_PointsBetList', response);

    return true;
}

module.exports.getPoolRummyBetList = async(requestData, client) => {
    
    console.log("getPoolRummyBetList requestData : ", requestData);

    let wh = {
        game_type : requestData.game_type,
        sub_type  : requestData.sub_type,
        is_active : true
    }
    if(typeof requestData.max_seat != "undefined")
        wh["max_seat"] = ([2,6].indexOf(Number(requestData.max_seat)) != -1)?Number(requestData.max_seat) : 2
    
   
    csl("getPoolRummyBetList wh, project : ", wh);

    let betList = await BetLists.aggregate([
        {
            $match : wh
        },{
            $project : {
                bet_id : "$_id",
                _id: 0 ,
                bet_value : "$bet_value",
                max_seat : 1,
                sub_type : 1
            }
        }
    ]);
    csl("getPoolRummyBetList betList : ", betList);

    let response = {
        betList : betList
    }
    respSendActions.SendDataToUser(client, 'Rummy_PoolBetList', response);

    return true;
}

module.exports.getDealRummyBetList = async(requestData, client) => {
    
    console.log("getDealRummyBetList requestData : ", requestData);

    let wh = {
        game_type : requestData.game_type,
        sub_type  : requestData.sub_type,
        is_active : true
    }
    if(typeof requestData.max_seat != "undefined")
        wh["max_seat"] = ([2,6].indexOf(Number(requestData.max_seat)) != -1)?Number(requestData.max_seat) : 2
    
   
    csl("getDealRummyBetList wh, project : ", wh);

    let betList = await BetLists.aggregate([
        {
            $match : wh
        },{
            $project : {
                bet_id : "$_id",
                _id: 0 ,
                bet_value : "$bet_value",
                max_seat : 1,
                sub_type : 1
            }
        }
    ]);
    csl("getDealRummyBetList betList : ", betList);

    let response = {
        betList : betList
    }
    respSendActions.SendDataToUser(client, 'Rummy_DealBetList', response);

    return true;
}