const gameInfo = require("./get_game_info");
const betInfo = require("./bet");
const getList = require("./get_list");
const claim   = require("./claim");
const cancel  = require("./cancel");
const adminGameInfo = require("./admin_game_info");

module.exports.eventHandler = async(en, requestData, client)=>{

    switch (en) {
        
        case 'ROULETTE_ZERO_3D_GAME_INFO':
            gameInfo.get_game_info(requestData, client);
            break;
        
        case 'ROULETTE_ZERO_3D_CLOSE_GAME':
            gameInfo.close_game(requestData, client);
            break;

        case 'ROULETTE_ZERO_3D_PLACE_BET':
            betInfo.place_bet(requestData, client);
            break;

        case 'ROULETTE_ZERO_3D_REPEAT_BET':
            betInfo.repeat_bet(requestData, client);
            break;

        case 'ROULETTE_ZERO_3D_GAME_HISTORY':
            getList.get_game_list(requestData, client);
            break;

        case 'ROULETTE_ZERO_3D_CLAIM':
            claim.claim(requestData, client);
            break;

        case 'ROULETTE_ZERO_3D_ALL_CLAIM':
            claim.all_claim(requestData, client);
            break;
                
        case 'ROULETTE_ZERO_3D_CANCEL_BET':
            cancel.cancel(requestData, client);
            break;

        case 'ROULETTE_ZERO_3D_GAME_SPECIFIC_INFO':
            gameInfo.get_specific_game_info(requestData, client);
            break;

        case 'ROULETTE_ZERO_3D_REPORT':
            getList.get_report(requestData, client);
            break;

        case 'ROULETTE_ZERO_3D_AUTO_ON_OFF':
            gameInfo.auto_on_off(requestData, client);
            break;
        
        case "ADMIN_ROULETTE_ZERO_3D_GAME_INFO":
            adminGameInfo.get_admin_game_info(requestData, client);
            break;
    }
}