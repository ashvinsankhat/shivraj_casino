module.exports.get_admin_game_info = async(requestData, client) => {
    try{
        let wh = {

        }
        let project = {

        }
        let gameInfo = await TriplePlayings.findOne(wh, project).lean();
        csl("get_admin_game_info userInfos : ", gameInfo);

        let room = "Admin_"+ gameInfo._id.toString();
        await this.joinTableRoom(room, client.sck_id);
        
        let init_timer = (typeof gameInfo.game_config != "undefined" && typeof gameInfo.game_config.NEXT_GAME_TIME != "undefined")?gameInfo.game_config.NEXT_GAME_TIME : 5;
        csl("get_admin_game_info init_timer : ", init_timer);

        let game_timer = (typeof gameInfo.game_config != "undefined" && typeof gameInfo.game_config.DRAW_TIME != "undefined")?gameInfo.game_config.DRAW_TIME : 60;
        csl("get_admin_game_info game_timer : ", game_timer);
        
        let spin_timer = (typeof gameInfo.game_config != "undefined" && typeof gameInfo.game_config.SPIN_TIME != "undefined")?gameInfo.game_config.SPIN_TIME : 5;
        csl("get_admin_game_info spin_timer : ", spin_timer);
        
        let timer = 0;
        if(gameInfo.game_state == "init_game" || gameInfo.game_state == "finish_state"){
            timer = init_timer - await commonClass.getTimeDifference(new Date(gameInfo.game_time.init_time), new Date(),'second');
        }else if(gameInfo.game_state == "game_timer_start"){
            timer = game_timer - await commonClass.getTimeDifference(new Date(gameInfo.game_time.gst_time), new Date(),'second');
        }else if( gameInfo.game_state == "start_spin"){
            timer = spin_timer - await commonClass.getTimeDifference(new Date(gameInfo.game_time.spin_time), new Date(),'second');
        }
        let bet_value = 0;

        if(gameInfo.game_state == "game_timer_start" || gameInfo.game_state == "start_spin"){
            let wh1 = {
                game_id : Number(gameInfo.game_id),
                game_type : "triple_chance",
            }
            let project1 = {
            }
            let lastBetInfo = await Lucky16CardTracks.findOne(wh1, project1).sort({_id:-1});
            csl("get_admin_game_info lastBetInfo : ", lastBetInfo);

            if(lastBetInfo != null){
                let card_details = lastBetInfo.card_details;
                csl("get_admin_game_info  card_details : ", card_details);

                for (let keys in card_details) {
                    csl("get_admin_game_info  bet : ", card_details[keys]);
                    bet_value = bet_value + Number(card_details[keys])
                }
                csl("get_admin_game_info  bet_value : ", bet_value);
            }
        }


        const lastCards = gameInfo.last_win_cards.slice(-6); 
        csl("get_admin_game_info lastCards : ", lastCards);
        gameInfo.last_win_cards = lastCards;
        
        gameInfo.auto_claim = false;
        gameInfo.timer = timer;
        gameInfo.total_wallet = 0;
        gameInfo.total_bet = 0;
        gameInfo.win = 0;

        gameInfo.bet_config = {
            "min" : {
                "in" : 5,
                "out" : 10,
            },
            "max" : {
                "in" : 10000,
                "out" : 50000,
            }
        }
        

        respSendActions.SendDataToUser(client, 'ADMIN_TRIPLE_GAME_INFO', gameInfo);        
    }catch(e) {
        console.log("Exception get_admin_game_info : ", e);
    }
}
module.exports.joinTableRoom = async(table_id, sck_id) => {
    csl("Join Table room : ", table_id, sck_id)
    playExchange.publish('globle.123', {
        en: 'JOIN_ROOM',
        data: {
            table_id : table_id,
            sck_id : sck_id
        }
    });
}