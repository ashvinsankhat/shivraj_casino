module.exports.deductWallet = async(id, chips, tType, t, tbInfo) => {
    try {
        csl('\ndedudctWallet : call.-->>>', id, chips, t);
        const wh = (typeof id == 'string') ? { _id: MongoID(id) } : { _id: id };
        if (typeof wh == 'undefined' || typeof wh._id == 'undefined' || wh._id == null || typeof tType == 'undefined') {
            return false;
        }
        chips = Number(chips.toFixed(2));
        let projection = {
            id        : 1, 
            display_user_name : 1, 
            unique_id : 1, 
            chips     : 1, 
            game_winning : 1, 
            sck_id       : 1,
            flags     : 1
        }

        const userInfo = await GameUser.findOne( wh, projection); 
        csl("dedudctWallet userInfo : ", userInfo);
        if(userInfo == null){
            return false;
        }
        csl("dedudctWallet userInfo :: ", userInfo);
        
        userInfo.chips          = (typeof  userInfo.chips == 'undefined' || isNaN( userInfo.chips))?0:Number(userInfo.chips);
        userInfo.game_winning   = (typeof  userInfo.game_winning == 'undefined' || isNaN( userInfo.game_winning))?0:Number(userInfo.game_winning);

        let op_game_winning = userInfo.game_winning;

        let setInfo = {
            $inc: {}
        };
        
        let tranferAmount = Number(chips.toFixed(2));
        let opening_bal =  Number((Number(userInfo.chips) + Number(userInfo.game_winning)).toFixed(2));
        if(userInfo.game_winning > 0 ){
            let game_reduse = ((userInfo.game_winning + Number(chips.toFixed(2)) ) > 0)? Number(chips.toFixed(2)) : Number(chips.toFixed(2)) - (userInfo.game_winning + Number(chips.toFixed(2)) )  ;             
            console.log("dedudctWallet game_reduse :: ", game_reduse);

            setInfo["$inc"]["game_winning"]  = Number(game_reduse.toFixed(2));
            
            chips = Number(chips.toFixed(2)) - Number(setInfo["$inc"]["game_winning"]);

            userInfo.game_winning = userInfo.game_winning + Number(setInfo["$inc"]["game_winning"]);
        }
        console.log("\ndedudctWallet chips :: ", chips);
        if(Number(chips.toFixed(2)) < 0){
            let game_reduse = ((userInfo.chips + Number(chips.toFixed(2)) ) > 0)? Number(chips.toFixed(2)) : Number(chips.toFixed(2)) - (Number(userInfo.chips.toFixed(2)) + chips )  ;             
            console.log("dedudctWallet game_reduse :: ", game_reduse);

            setInfo["$inc"]["chips"]  = Number(game_reduse.toFixed(2));
            
            chips = chips - Number(setInfo["$inc"]["chips"]);

            userInfo.chips = userInfo.chips + Number(setInfo["$inc"]["chips"]);
        }
        
        var fChips = Number((Number(userInfo.chips) + Number(userInfo.game_winning)).toFixed(2));
        if (Number(fChips) < 0) {
            fChips = 0;
        }
        csl("dedudctWallet userInfo :: ", userInfo);
        
        let totalRemaningAmount = Number(fChips).toFixed(2);
        
        if (typeof tType != 'undefined') {
            
            let walletTrack = {
                id            : userInfo.id,
                unique_id     : userInfo.unique_id,
                user_id       : wh._id.toString(),
                trnx_type     : tType,
                trnx_type_txt : t,
                trnx_amount   : tranferAmount,
                opening_bal   : opening_bal,
                op_game_winning : op_game_winning,
                game_winning  : userInfo.game_winning,
                total_bucket  : totalRemaningAmount,
                deposit_id    : (tbInfo && tbInfo.diposit_id) ? tbInfo.diposit_id : "",
                withdraw_id   : (tbInfo && tbInfo.withdraw_id) ? tbInfo.withdraw_id : "",
                game_id       : (tbInfo && tbInfo.game_id) ? tbInfo.game_id : "",
                is_robot      : (typeof userInfo.flags != "undefined" && userInfo.flags.is_robot) ? userInfo.flags.is_robot : 0,
                game_type     : (tbInfo && tbInfo.game_type) ? tbInfo.game_type : "", //Game Type
                max_seat      : (tbInfo && tbInfo.max_seat) ? tbInfo.max_seat : 0,//Maxumum Player.
                bet           : (tbInfo && tbInfo.bet) ? tbInfo.bet : 0,
                table_id      : (tbInfo && tbInfo._id) ? tbInfo._id.toString() : ""
            }
            await this.trackUserWallet(walletTrack);
        }
       

        if(Object.keys(setInfo["$inc"]).length > 0){
            for(let key in setInfo["$inc"]){
                setInfo["$inc"][key] = parseFloat(setInfo["$inc"][key].toString());
            }
        }
        if(Object.keys(setInfo["$inc"]).length == 0){
            delete setInfo["$inc"];
        }

        csl("\ndedudctWallet wh :: ", wh, setInfo);
        let upReps = await GameUser.findOneAndUpdate( wh, setInfo, {new:true});    
        csl("\ndedudctWallet upReps :: ", upReps);
        
        upReps.chips          = (typeof  upReps.chips == 'undefined' || isNaN( upReps.chips))?0:Number(upReps.chips);
        upReps.game_winning   = (typeof  upReps.game_winning == 'undefined' || isNaN(upReps.game_winning))?0:Number(upReps.game_winning);
      
        if((typeof upReps.chips.toString().split(".")[1] != "undefined" && upReps.chips.toString().split(".")[1].length > 2) || (typeof upReps.game_winning.toString().split(".")[1] != "undefined" && upReps.game_winning.toString().split(".")[1].length > 2)){
              
            let updateData = {
                $set:{ }
            }
            updateData["$set"]["chips"]  = parseFloat(upReps.chips.toFixed(2))  
            
            updateData["$set"]["game_winning"]  = parseFloat(upReps.game_winning.toFixed(2))  
            
            if(Object.keys(updateData.$set).length > 0){
                let upRepss = await GameUser.findOneAndUpdate( wh, updateData, {new:true});    
                csl("\ndedudctWallet upRepss  :: ",upRepss);
            }
        }
        respSendActions.SendDataToDirect(userInfo.sck_id, 'UPDATED_WALLET', {
            game_winning  : upReps.game_winning,
            chips         : fChips ,
            t : t
        });
        if(typeof tbInfo != "undefined" && tbInfo != null &&  typeof tbInfo._id != "undefined" ){
            if(typeof tbInfo.player_info != "undefined" && tbInfo.player_info.length > 0){
                for(let i = 0 ; i < tbInfo.player_info.length ; i++){
                    if(typeof tbInfo.player_info[i] != "undefined" && typeof tbInfo.player_info[i].user_info != "undefined" && tbInfo.player_info[i].user_info._id.toString() == wh._id.toString()){
                        
                        var tbWh = {
                            _id: MongoID(tbInfo._id.toString()),
                            "player_info.user_info._id": MongoID(wh._id.toString())
                        }
                        await RummyPlayingTables.updateOne( tbWh, { $set: { "player_info.$.user_info.chips": fChips } });
                        
                        respSendActions.FireEventToTable(tbInfo._id.toString(), "Rummy_User_Wallet",  {seat_index : tbInfo.player_info[i].seat_index, chips:fChips});
                        break;
                    }
                }
            }
        }
        return fChips;
    } catch (e) {
        console.log("deductWallet : 1 : Exception : 1", e)
        return 0
    }
}
module.exports.addWallet = async(id, chips, tType, t, tbInfo) => {
    try {
        csl('\naddWallet : call.-->>>', id, chips, t);
        const wh = (typeof id == 'string') ? { _id: MongoID(id) } : { _id: id };
        if (typeof wh == 'undefined' || typeof wh._id == 'undefined' || wh._id == null || typeof tType == 'undefined') {
            return false;
        }
        chips = Number(chips.toFixed(2));
        let projection = {
            id        : 1, 
            un        : 1, 
            unique_id : 1, 
            chips     : 1, 
            game_winning : 1, 
            sck_id       : 1,
            flags     : 1
        }

        const userInfo = await GameUser.findOne( wh, projection); 
        csl("addWallet userInfo : ", userInfo);
        if(userInfo == null){
            return false;
        }
        
        userInfo.chips          = (typeof  userInfo.chips == 'undefined' || isNaN( userInfo.chips))?0:Number(userInfo.chips);
        userInfo.game_winning   = (typeof  userInfo.game_winning == 'undefined' || isNaN( userInfo.game_winning))?0:Number(userInfo.game_winning);

        let op_game_winning = userInfo.game_winning;

        let setInfo = {            
            $inc: {}
        };
        
        csl("\naddWallet setInfo :: ", setInfo);
        setInfo['$inc']['game_winning'] = Number(chips.toFixed(2));
        userInfo.game_winning = Number(userInfo.game_winning) + Number(chips.toFixed(2));
        userInfo.game_winning = Number(userInfo.game_winning.toFixed(2))

        var tranferAmount = Number(chips.toFixed(2));;
        
        var fChips = Number((userInfo.chips).toFixed(2)) + Number(userInfo.game_winning);
        if (Number(fChips) < 0) {
            fChips = 0;
        }
        csl("addWallet userInfo :: ", userInfo);
        
        let totalRemaningAmount = Number(fChips).toFixed(2);
        
        if (typeof tType != 'undefined') {
            
            let walletTrack = {
                id            : userInfo.id,
                unique_id     : userInfo.unique_id,
                user_id       : wh._id.toString(),
                trnx_type     : tType,
                trnx_type_txt : t,
                trnx_amount   : tranferAmount,
                opening_bal   : userInfo.chips,
                op_game_winning : op_game_winning,
                game_winning  : userInfo.game_winning,
                total_bucket  : totalRemaningAmount,
                deposit_id    : (tbInfo && tbInfo.diposit_id) ? tbInfo.diposit_id : "",
                withdraw_id   : (tbInfo && tbInfo.withdraw_id) ? tbInfo.withdraw_id : "",
                game_id       : (tbInfo && tbInfo.game_id) ? tbInfo.game_id : "",
                is_robot      : (typeof userInfo.flags != "undefined" && userInfo.flags.is_robot) ? userInfo.flags.is_robot : 0,
                game_type     : (tbInfo && tbInfo.game_type) ? tbInfo.game_type : "", //Game Type
                max_seat      : (tbInfo && tbInfo.max_seat) ? tbInfo.max_seat : 0,//Maxumum Player.
                bet           : (tbInfo && tbInfo.bet) ? tbInfo.bet : 0,
                table_id      : (tbInfo && tbInfo._id) ? tbInfo._id.toString() : ""
            }
            await this.trackUserWallet(walletTrack);
        }
       
        // setInfo.$set["chips"] = Number(Number(totalRemaningAmount).toFixed(2));

        if(Object.keys(setInfo["$inc"]).length > 0){
            for(let key in setInfo["$inc"]){
                setInfo["$inc"][key] = parseFloat(setInfo["$inc"][key].toString());
            }
        }
        if(Object.keys(setInfo["$inc"]).length == 0){
            delete setInfo["$inc"];
        }

        csl("\naddWallet wh :: ", wh, setInfo);
        let upReps = await GameUser.findOneAndUpdate( wh, setInfo, {new:true});    
        csl("\naddWallet upReps :: ", upReps);
        
        upReps.chips          = (typeof  upReps.chips == 'undefined' || isNaN( upReps.chips))?0:Number(upReps.chips);
        upReps.game_winning   = (typeof  upReps.game_winning == 'undefined' || isNaN(upReps.game_winning))?0:Number(upReps.game_winning);
        
        if((typeof upReps.chips.toString().split(".")[1] != "undefined" && upReps.chips.toString().split(".")[1].length > 2) || (typeof upReps.game_winning.toString().split(".")[1] != "undefined" && upReps.game_winning.toString().split(".")[1].length > 2)){
              
            let updateData = {
                $set:{ }
            }
            updateData["$set"]["chips"]  = parseFloat(upReps.chips.toFixed(2))  
            
            updateData["$set"]["game_winning"]  = parseFloat(upReps.game_winning.toFixed(2))  
            
            if(Object.keys(updateData.$set).length > 0){
                let upRepss = await GameUser.findOneAndUpdate( wh, updateData, {new:true});    
                csl("\naddWallet upRepss  :: ",upRepss);
            }
        }
        respSendActions.SendDataToDirect(userInfo.sck_id, 'UPDATED_WALLET', {
            game_winning  : upReps.game_winning,
            chips         : fChips ,
            t : t
        });
        return fChips;
    } catch (e) {
        console.log("addWallet : 1 : Exception : 1", e)
        return 0
    }
}
module.exports.trackUserWallet = async(obj) => {
    csl("\ntrackUserWallet obj ::", obj);
    await UserWalletTracks.create(obj)
    return true;
}