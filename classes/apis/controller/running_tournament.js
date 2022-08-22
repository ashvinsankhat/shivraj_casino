
module.exports.getRunningTournament = async(req, res) => {
    let wh = {
        state : {$in : ["running_tournament","wating_for_user_register","start_user_register"]}
    };
    let tournament_infos = await TournamentPlayings.find(wh,{});
    console.log("getRunningTournament tournament_infos ::", tournament_infos)
    res.render('running_tournament',{data:tournament_infos,messages : {success : "Record Get Success",error : false}});
}