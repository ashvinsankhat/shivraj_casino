module.exports.play_tracks = async(amount, client) => {

    var date1 = new Date();
    date1.setSeconds(date1.getSeconds() + Number(19800));
    let date = dateFormat(new Date(date1), "d:mm:yyyy");
    csl("\nplay_tracks date :: ", date )
    let wh = {
        user_id : client._id,
        game_type : "roulette_zero_3d",
        date : date
    }
    const trackInfo = await Lucky16ReportTracks.findOne( wh, {});
    csl("play_tracks trackInfo :: ", trackInfo);

    if(trackInfo == null){
        await Lucky16ReportTracks.create(wh);
    }

    let updateData = {
        $set : {
            user_id : client._id,
            date : date
        },
        $inc : {
            "play_amount" : amount
        }
    }

    if(typeof client.user_name != "undefined" && client.user_name){
        updateData["$set"]["user_name"] = client.user_name
    }
    csl("play_tracks wh , updateData:: ", wh, updateData )

    let upReps = await Lucky16ReportTracks.findOneAndUpdate( wh, updateData, {new:true});    
    csl("play_tracks upReps :: ", upReps);

    return true;
}
module.exports.claim_tracks = async(amount, client) => {

    let date1 = new Date();
    date1.setSeconds(date1.getSeconds() + Number(19800));
    let date = dateFormat(new Date(date1), "d:mm:yyyy");
    csl("\nclaim_tracks date :: ", date )
    let wh = {
        user_id : client._id,
        game_type : "roulette_zero_3d",
        date : date
    }
    const trackInfo = await Lucky16ReportTracks.findOne( wh, {});
    csl("claim_tracks trackInfo :: ", trackInfo);

    if(trackInfo == null){
        await Lucky16ReportTracks.create(wh);
    }
    
    let updateData = {
        $set : {
            user_id : client._id,
            date : date
        },
        $inc : {
            "claim_amount" : amount
        }
    }
    csl("claim_tracks wh , updateData:: ", wh, updateData )

    let upReps = await Lucky16ReportTracks.findOneAndUpdate( wh, updateData, {new:true});    
    csl("claim_tracks upReps :: ", upReps);

    return true;
}
module.exports.unclaim_tracks = async(amount, client) => {

    let date1 = new Date();
    date1.setSeconds(date1.getSeconds() + Number(19800));
    let date = dateFormat(new Date(date1), "d:mm:yyyy");
    csl("\nunclaim_tracks date :: ", date )
    let wh = {
        user_id : client._id,
        game_type : "roulette_zero_3d",
        date : date
    }
    const trackInfo = await Lucky16ReportTracks.findOne( wh, {});
    csl("unclaim_tracks trackInfo :: ", trackInfo);

    if(trackInfo == null){
        await Lucky16ReportTracks.create(wh);
    }
    
    let updateData = {
        $set : {
            user_id : client._id,
            date : date
        },
        $inc : {
            "unclaim_amount" : amount
        }
    }
    csl("unclaim_tracks wh , updateData:: ", wh, updateData )

    let upReps = await Lucky16ReportTracks.findOneAndUpdate( wh, updateData, {new:true});    
    csl("unclaim_tracks upReps :: ", upReps);

    return true;
}