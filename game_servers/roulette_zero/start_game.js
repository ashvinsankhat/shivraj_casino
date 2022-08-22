const {
    start_game_timer
} = require("./start_gst");
const {
    start_spin
} = require("./start_spin")
const {
    check_winner
} = require("./check_winner");
const {
    finish_round
} = require("./finish");
const {
    addWallet
} = require("./wallet_update")
const {
    win_tracks,
    loss_tracks,
    claim_tracks,
    unclaim_tracks
} = require("./report_track");

module.exports.roulette_zero_start_game = async() => {

    let wh = {
    }
    let project = {
    }
    let gameInfo = await RouletteZeroPlayings.findOne(wh, project).lean();
    csl("roulette_zero_start_game userInfos : ", gameInfo);
    if(gameInfo == null){
        let insertData = {
            game_state : "init_game",
            win_card : "",
            bet_users_cards : {},
            game_time : {},
            winners : 0,
            game_id : ""
        }
        gameInfo = await RouletteZeroPlayings.create(insertData);
    }
    csl("roulette_zero_start_game userInfos : ", gameInfo);
    if(gameInfo.game_state == "init_game" || gameInfo.game_state == "finish_state"){
        let updateData = {
            $set : {
                win_card : "",
                game_state : "init_game",
                bet_users_cards : {},
                winner_users : [],
                game_time : {},
                winners : 0,
                "game_time": {
                    init_time :new Date()
                },
                total_bet_on_cards : {}
            }
        }
        if(gameInfo.last_win_cards.length > 10){
            
            const lastCards = gameInfo.last_win_cards.slice(-10); 
            csl("roulette_zero_start_game lastCards : ", lastCards);
            
            updateData["$set"] = {
                last_win_cards : lastCards
            }
        }
        csl("roulette_zero_start_game wh , project 1: ", wh, updateData);
    
        gameInfo = await RouletteZeroPlayings.findOneAndUpdate(wh, updateData, {new :true});
        csl("roulette_zero_start_game userInfos : ", gameInfo); 
        
        let response = {
            time : 5,
            msg : "Server restart!, So game Start Again!"
        }
        respSendActions.FireEventToTable(gameInfo._id.toString(), "ROULETTE_ZERO_INIT_GAME", response);
    
        let job_id  = "INIT:"+gameInfo._id;
        const turnExpireTime = await commonClass.AddTime(5);
        csl("roulette_zero_start_game : ", job_id, new Date(), new Date(turnExpireTime));
    
        let table_id = gameInfo._id;
        const delayRes = await scheduleClass.setScheduler(job_id, new Date(turnExpireTime));
        csl("roulette_zero_start_game  delayRes: ", delayRes);
    
        await start_game_timer(table_id)
    }else if(gameInfo.game_state == "game_timer_start"){
        let timer = 90 - await commonClass.getTimeDifference(new Date(gameInfo.game_time.gst_time), new Date(),'second');
        if(timer < 0) timer = 2;
        let job_id  = "GST:"+gameInfo._id;
        const turnExpireTime = await commonClass.AddTime(timer + 1);
        csl("roulette_zero_start_game : ", job_id, new Date(), new Date(turnExpireTime));

        let table_id = gameInfo._id;
        const delayRes = await scheduleClass.setScheduler(job_id, new Date(turnExpireTime));
        csl("roulette_zero_start_game  delayRes: ", delayRes);

        await start_spin(table_id)
        return false;   

    }else if( gameInfo.game_state == "start_spin"){
        let job_id  = "SPT:"+gameInfo._id;
        const turnExpireTime = await commonClass.AddTime(5);
        csl("roulette_zero_start_game : ", job_id, new Date(), new Date(turnExpireTime));
    
        let table_id = gameInfo._id;
        const delayRes = await scheduleClass.setScheduler(job_id, new Date(turnExpireTime));
        csl("roulette_zero_start_game  delayRes: ", delayRes);
    
        await check_winner(table_id);
        
        return true;
    }else if( gameInfo.game_state == "winner_declare"){
        let winnerDone = await this.game_winning(gameInfo); 
        gameInfo["winner_users"] = winnerDone;

        await this.game_tracks(gameInfo);
        
        await finish_round(gameInfo);     

        return true;
    }else{
        console.log("roulette_zero_start_game Game state is different......!");
    }

    return true;
}

module.exports.game_winning = async(gameInfo) => {
    csl("add_winning_amount gameInfo : ", gameInfo);

    if(Object.keys(gameInfo.bet_users_cards).length == 0)
        return [];

    let winner_users =[];

    let win_array = Number(gameInfo.win_card);

    csl("add_winning_amount win_array : ", win_array);
    
    let bet_users_ticktes = gameInfo.bet_users_cards;
    csl("add_winning_amount bet_users_ticktes : ", bet_users_ticktes);

    let x_reward = (typeof gameInfo.game_config != "undefined" && typeof gameInfo.game_config.REWARD_X != "undefined")?gameInfo.game_config.REWARD_X : 0;
    let n_reward = (typeof gameInfo.game_config != "undefined" && typeof gameInfo.game_config.REWARD_NORMAL != "undefined")?gameInfo.game_config.REWARD_NORMAL : 36;
    csl("add_winning_amount x_reward, n_reward : ", x_reward, n_reward);
    
    for(let user_id_keys in bet_users_ticktes){

        let ticket_ids = bet_users_ticktes[user_id_keys];
        csl("add_winning_amount ticket_ids: ", ticket_ids);
        
        if(ticket_ids.length != 0){

            let wh = {
                _id : MongoID(user_id_keys.toString())
            }
            let project = {
                cards_16_config : 1
            }
            csl("add_winning_amount wh, project : ", wh, project);

            let userInfo = await GameUser.findOne(wh, project).lean();
            csl("add_winning_amount userInfo : ", userInfo);
    
            if(userInfo != null){
                let commission_rate = (typeof userInfo.cards_16_config != "undefined" && typeof userInfo.cards_16_config.commission != "undefined")?userInfo.cards_16_config.commission  : 3.5;
                csl("add_winning_amount commission_rate : ", commission_rate);

                let total_win = 0
                let total_bet = 0;
                let win_cards = [];
                
                for(let key = 0 ; key < ticket_ids.length ; key++){
                    
                    let tickets_wh = {
                        ticket_id : ticket_ids[key],
                        status : 0
                    }
                    csl("add_winning_amount tickets_wh : ", tickets_wh);

                    let gameBetInfo = await Lucky16CardTracks.findOne(tickets_wh,{}).lean()
                    csl("add_winning_amount gameBetInfo :", gameBetInfo);

                    if(gameBetInfo != null){
                        let card_details = gameBetInfo.card_details

                        let total_win_amount  = 0;
                        let total_bet_amount  = gameBetInfo.total_bet_amount;
                    
                        for (let keys in card_details) {
                            csl("add_winning_amount  bet : ", card_details[keys]);
                            let bet_numbers = [];
                            if(keys == "1st_12" || keys == "2nd_12" || keys == "3rf_12"){
                                if(keys == "1st_12"){
                                    bet_numbers = [1,2,3,4,5,6,7,8,9,10,11,12]
                                }else if(keys == "2nd_12"){
                                    bet_numbers = [13,14,15,16,17,18,19,20,21,22,23,24]
                                }else if(keys == "3rf_12"){
                                    bet_numbers = [25,26,27,28,29,30,31,32,33,34,35,36]
                                }
                            }else if(keys == "1to18" || keys == "19to36"){
                                if(keys == "1to18"){
                                    bet_numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
                                }else if(keys == "19to36"){
                                    bet_numbers = [19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36]
                                }
                            }else if(keys == "Even" || keys == "ODD" || keys == "Red_Chokadi" || keys == "Black_Chokadi"){
                                if(keys == "Even"){
                                    bet_numbers  = [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36];
                                }else if(keys == "ODD"){
                                    bet_numbers  = [1,3,5,7,9,11,13,15,18,19,21,23,25,27,29,31,33,35];
                                }else if(keys == "Red_Chokadi"){
                                    bet_numbers  = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
                                }else if(keys == "Black_Chokadi"){
                                    bet_numbers  = [2,4,8,6,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
                                }
                            }else if(keys == "2To1_FirstRow" || keys == "2To1_SecondRow" || keys == "2To1_ThirdRow"){
                                if(keys == "2To1_FirstRow"){
                                    bet_numbers  = [3,6,9,12,15,18,21,24,27,30,33,36];
                                }else if(keys == "2To1_SecondRow"){
                                    bet_numbers  = [2,5,8,11,14,17,20,23,26,29,32,35];
                                }else if(keys == "2To1_ThirdRow"){
                                    bet_numbers  = [1,4,7,10,13,16,19,22,25,28,31,34];
                                }
                            }else{
                                bet_numbers = keys.split("-");
                            }

                            if(bet_numbers.indexOf(win_array) != -1){
                                win_cards.push(keys);
                                let bet_value = Number(card_details[keys]);
                                let win_amount = 0;

                                win_amount = Number(bet_value) * n_reward;

                                if(x_reward != 0)
                                    win_amount = win_amount * x_reward
                                
                                total_win_amount = total_win_amount + win_amount

                                csl("add_winning_amount  win_amount, bet_value : ", win_amount, bet_value);
                            }
                        }
                        csl("add_winning_amount  total_win_amount : ", total_win_amount);

                        if(total_win_amount > 0){
                            total_win = total_win + total_win_amount;
                            let uwh = {
                                _id : MongoID(gameBetInfo.user_id)
                            }
                            let uProject = {
                                cards_16_config : 1
                            }
                            csl("place_bet uwh, uProject : ", uwh, uProject);
                        
                            let userInfo = await GameUser.findOne(uwh, uProject).lean();
                            csl("place_bet userInfo : ", userInfo);

                            let response = {
                                win_card : win_cards,
                                win_amount : total_win_amount,
                                user_id  : gameBetInfo.user_id,
                            }
                            let wh = {
                                _id : gameInfo._id
                            }
                            let updateData = {
                                $inc : {
                                    winners : 1
                                },
                                $push : {
                                    winner_users : gameBetInfo.ticket_id
                                }
                            }
                            csl("check_winner wh , project 1: ", wh, updateData);
                        
                            let gameInfo1 = await RouletteZeroPlayings.findOneAndUpdate(wh, updateData, {new :true});
                            csl("check_winner gameInfo1 : ", gameInfo1);

                            winner_users.push(response)

                            let auto_claim = false;
                            
                            /* 
                                0 = blank
                                1 = cancelled
                                2 = not_claim
                                3 = claim 
                                4 = loss
                            */
                            
                            let status = (auto_claim) ? 3 : 2 ;
                            
                            let wh16 = {
                                user_id : gameBetInfo.user_id,
                                ticket_id : gameBetInfo.ticket_id
                            }
                            let updateData16 = {
                                $set : {
                                    total_win_amount : total_win_amount,
                                    status : status,
                                    result_card : gameInfo.win_card,
                                    draw_time : new Date()
                                }
                            }

                            let gameTrackInfo = await Lucky16CardTracks.findOneAndUpdate(wh16, updateData16, {new :true});
                            csl("check_winner gameTrackInfo : ", gameTrackInfo);
                            
                            await win_tracks(total_bet_amount, total_win_amount, commission_rate, {_id : gameBetInfo.user_id});

                            // if(auto_claim){

                            //     await claim_tracks(total_win_amount, {_id : gameBetInfo.user_id});    
                            //     await addWallet(gameBetInfo.user_id, total_win_amount, 2, "Lucky card 23 winner", gameInfo1);

                            // }else{

                            await unclaim_tracks(total_win_amount, {_id : gameBetInfo.user_id});

                            // }

                            response["total_bet_amount"] = total_bet_amount;
                            response["ticket_id"] = gameBetInfo.ticket_id;

                            // respSendActions.SendDataToUidDirect( gameBetInfo.user_id.toString() , 'LUCKY_CARD_WIN', response);

                        }else{
                            /* 
                                0 = blank
                                1 = cancelled
                                2 = auto-claim
                                3 = claim 
                                4 = loss
                            */
                            
                            let wh16 = {
                                user_id : gameBetInfo.user_id,
                                ticket_id : gameBetInfo.ticket_id
                            }
                            let updateData16 = {
                                $set : {
                                    status : 4,
                                    result_card : gameInfo.win_card,
                                    draw_time : new Date()
                                }
                            }
                            let gameTrackInfo = await Lucky16CardTracks.findOneAndUpdate(wh16, updateData16, {new :true});
                            csl("check_winner gameTrackInfo : ", gameTrackInfo);

                            await loss_tracks(total_bet_amount, 0, commission_rate, {_id : gameBetInfo.user_id});

                            // let response = {
                            //     ticket_id : gameBetInfo.ticket_id,
                            //     win_card : [],
                            //     win_amount : 0,
                            //     total_bet_amount : total_bet_amount,
                            //     user_id : gameBetInfo.user_id
                            // }
                            // respSendActions.SendDataToUidDirect( gameBetInfo.user_id , 'LUCKY_CARD_LOSE', response);
                        }
                    }
                }
                
                csl("add_winning_amount  total_win, total_bet : ", total_win, total_bet);
                let response = {
                    ticket_id  : ticket_ids,
                    win_card   : win_cards,
                    win_amount : total_win,
                    total_bet_amount : total_bet,
                    user_id : user_id_keys,
                    take    : false
                }

                let en = "ROULETTE_ZERO_WIN";
                if(total_win == 0){
                    en = "ROULETTE_ZERO_LOSE";
                }else{
                    response.take = true;
                }
                respSendActions.SendDataToUidDirect( user_id_keys , en, response);
            }
        }
    }

    return winner_users;
}

module.exports.game_tracks = async (gameInfo) => {

    let trackInfo = Object.assign({}, gameInfo);
    delete trackInfo._id;
    
    csl("game_tracks trackInfo :",trackInfo);
    await LuckyCardPlayTracks.create(trackInfo);

    return true;
}