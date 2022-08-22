module.exports.user_block = async(req, res) => {
    csl("user_block  : req : ",req.body);
    let data = req.body;
    let user_id = data.user_id;
    let is_block = data.is_block;
    let message = "You are block now, please contact Admin!!";

    if(!is_block){
        message = "Congrasulation!! you are unblock now enjoy casino game.";
    }
    let wh = {
        _id : user_id
    }
    let setInfo = {
        $set : {
            'flags.is_block' : is_block
        }
    }
    csl("user_block wh, setInfo : ", wh, setInfo);

    let user_info = await GameUser.findOneAndUpdate( wh, setInfo, {new:true});    
    csl("user_block  user_info : ", user_info);

    if(user_info.sck_id != "")
        await redisClass.hset('session:' + user_info.sck_id, "is_block", is_block);

    respSendActions.SendDataToUidDirect(user_id, 'USER_BLOCK', {
        is_block : is_block,
        message :message
    });

    res.send("Ok");
}