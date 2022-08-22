module.exports.lucky_16_game_config_update = async(req, res) => {
    respSendActions.SendToAllUser("all",  'LUCKY_16_GAME_CONFIG', {});
    res.send("Ok");
}