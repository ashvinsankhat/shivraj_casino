
module.exports.updateGameWallet = async(trackData) => {
    
    csl('\nupdateGameWalletAndTrack call :: ', trackData);
    const chips = Number(trackData.chips.toFixed(2));

    const upData = {
        $set : {
            type : "gameWallet"
        },
        $inc : {
            chips : chips
        }
    } 
    csl('updateGameWalletAndTrack upData :: ', upData);
    
    const updateInfo = await GameWallet.findOneAndUpdate({type : "gameWallet" }, upData, {upsert : true, new:true});    
    csl('updateGameWalletAndTrack updateInff :: ', updateInfo);
    
    const insertData = {
        userId     : trackData.UserId,
        id         : trackData.id,
        openBal    : Number((Number(updateInfo.chips) - Number(chips)).toFixed(2)),
        closeBal   : Number((Number(updateInfo.chips).toFixed(2))),
        trnxAmount : Number(chips),
        trnxTypeTxt: trackData.t,
        ei         : trackData.ei
    }
    csl('updateGameWalletAndTrack  insertData :: ', insertData);
    await GameWalletTracks.create(insertData);
    
    return true;
}