module.exports.get_admin_game_info = async(gameInfo) => {
    try{
        let gameDataInfo = Object.assign({}, gameInfo)
        csl("get_admin_game_info gameDataInfo :: ", gameDataInfo);
        
        let init_timer = (typeof gameDataInfo.game_config != "undefined" && typeof gameDataInfo.game_config.NEXT_GAME_TIME != "undefined")?gameDataInfo.game_config.NEXT_GAME_TIME : 5;
        csl("get_admin_game_info init_timer : ", init_timer);

        let game_timer = (typeof gameDataInfo.game_config != "undefined" && typeof gameDataInfo.game_config.DRAW_TIME != "undefined")?gameDataInfo.game_config.DRAW_TIME : 60;
        csl("get_admin_game_info game_timer : ", game_timer);
        
        let spin_timer = (typeof gameDataInfo.game_config != "undefined" && typeof gameDataInfo.game_config.SPIN_TIME != "undefined")?gameDataInfo.game_config.SPIN_TIME : 5;
        csl("get_admin_game_info spin_timer : ", spin_timer);

        let timer = 0;
        if(gameDataInfo.game_state == "init_game" || gameDataInfo.game_state == "finish_state"){
            timer = init_timer - await commonClass.getTimeDifference(new Date(gameDataInfo.game_time.init_time), new Date(),'second');
        }else if(gameDataInfo.game_state == "game_timer_start"){
            timer = game_timer - await commonClass.getTimeDifference(new Date(gameDataInfo.game_time.gst_time), new Date(),'second');
        }else if( gameDataInfo.game_state == "start_spin"){
            timer = spin_timer - await commonClass.getTimeDifference(new Date(gameDataInfo.game_time.spin_time), new Date(),'second');
        }
        csl("get_admin_game_info timer : ", timer);

        let bet_value = 0;
        if(gameDataInfo.game_state == "game_timer_start" || gameDataInfo.game_state == "start_spin"){
            let wh1 = {
                game_id : Number(gameDataInfo.game_id),
                game_type : "roulette_european",
            }
            let project1 = {
            }
            let lastBetInfo = await Lucky16CardTracks.findOne(wh1, project1).sort({_id:-1});
            csl("get_game_info lastBetInfo : ", lastBetInfo);

            if(lastBetInfo != null){
                let card_details = lastBetInfo.card_details;
                csl("get_game_info  card_details : ", card_details);

                for (let keys in card_details) {
                    csl("get_game_info  bet : ", card_details[keys]);
                    bet_value = bet_value + Number(card_details[keys])
                }
                csl("get_game_info  bet_value : ", bet_value);
            }
        }

        delete gameDataInfo.game_config.COMMISSION;

        const lastCards = gameDataInfo.last_win_cards.slice(-10); 
        csl("check_winner lastCards : ", lastCards);
        gameDataInfo.last_win_cards = lastCards;
        
        gameDataInfo.auto_claim = false;
        gameDataInfo.timer = timer;
        gameDataInfo.total_wallet = 0;
        gameDataInfo.total_bet = 0;
        gameDataInfo.win = 0;

        gameDataInfo.bet_config = {
            "min" : {
                "in" : 5,
                "out" : 10,
            },
            "max" : {
                "in" : 10000,
                "out" : 50000,
            }
        }
           
        let room = "Admin_"+ gameDataInfo._id.toString();
        respSendActions.FireEventToTable(room, "ADMIN_ROULETTE_EUROPEAN_GAME_INFO", gameDataInfo);
            
    }catch(e) {
        console.log("Exception get_game_info : ", e);
    }
}