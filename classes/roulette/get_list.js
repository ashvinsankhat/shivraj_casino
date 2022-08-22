module.exports.get_game_list = async(requestData, client) => {
    try{
        if(typeof client._id == "undefined"){
            respSendActions.SendDataToDirect(client.sck_id, 'ROULETTE_GAME_HISTORY', requestData , true, "1000" , "User session not set, please restart game!", "Error!");
            return true;
        }
        if(typeof client.get_list != "undefined" && client.get_list){
            console.log("Please wait some time....!")
            return false;
        }
        client.get_list = true;

        let start_date  = await this.get_start_date(new Date(), false);
        let end_date  = await this.get_end_date(new Date(), false);
        
        if(typeof requestData.is_filter != "undefined" && requestData.is_filter){
           start_date  = await this.get_start_date(requestData.start_date, true);
           end_date  = await this.get_end_date(requestData.end_date, true);
        }
        
        csl("get_game_list start_date :", start_date);
        csl("get_game_list end_date :", end_date);

        let wh = {
            user_id : client._id,
            game_type : "roulette",
            createdAt : {
                $gte : start_date,
                $lte : end_date
            }
        }
        csl("get_game_list wh :", wh);
        let project = {
            game_id : 1,
            ticket_id : 1,
            total_bet_amount : 1,
            total_win_amount : 1,
            draw_time : 1,
            result_card : 1,
            status :1,
            createdAt :1
        }
        let gameLists = await Lucky16CardTracks.find(wh,project).sort({_id:-1})
        csl("get_game_list gameLists :", gameLists);

        let response = {
            game_lists : gameLists
        }
        respSendActions.SendDataToUser(client, 'ROULETTE_GAME_HISTORY', response);
        delete client.get_list
        return false;
    }catch(e){
        console.log("Exception get_game_list ::", e);
    }
}
module.exports.get_report = async(requestData, client) => {
    try{
        if(typeof client._id == "undefined"){
            respSendActions.SendDataToDirect(client.sck_id, 'ROULETTE_REPORT', requestData , true, "1000" , "User session not set, please restart game!", "Error!");
            return true;
        }
        if(typeof client.get_report != "undefined" && client.get_report){
            console.log("Please wait some time....!")
            return false;
        }
        client.get_report = true;

        let start_date  = await this.get_start_date(new Date(), false);
        let end_date  = await this.get_end_date(new Date(), false);
    
        if(typeof requestData.is_filter != "undefined" && requestData.is_filter){
            start_date  = await this.get_start_date(requestData.start_date, true);
            end_date  = await this.get_end_date(requestData.end_date, true);
        }

        csl("get_report start_date :", start_date);
        csl("get_report end_date :", end_date);

        let wh = {
            user_id : MongoID(client._id),
            game_type : "roulette",
            createdAt : {
                $gte : new Date(start_date),
                $lte : new Date(end_date)
            }
        }
        let pipeline = [
            {
                $match : wh
            },{
                $group : {
                    _id : "$user_name",
                    play_amount : {
                        $sum : '$play_amount'
                    },
                    win_amount : {
                        $sum : '$win_amount'
                    },
                    claim_amount : {
                        $sum : '$claim_amount'
                    },
                    unclaim_amount : {
                        $sum : '$unclaim_amount'
                    },
                    end_amount : {
                        $sum : '$end_amount'
                    },
                    commission_amount : {
                        $sum : '$commission_amount'
                    },
                    ntp_amount : {
                        $sum : '$ntp_amount'
                    }
                }
            },{
                $project : {                    
                    user_name : "$_id",
                    play_amount : "$play_amount",
                    win_amount : "$win_amount",
                    claim_amount : "$claim_amount",
                    unclaim_amount : "$unclaim_amount",
                    end_amount : "$end_amount",
                    commission_amount : "$commission_amount",
                    ntp_amount : "$ntp_amount",
                    _id : 0
                }
            }
        ]
        csl("get_report pipeline :", pipeline);

        let gameLists = await Lucky16ReportTracks.aggregate(pipeline);
        csl("get_report gameLists :", gameLists);

        let response = {
            game_lists : gameLists
        }
        
        respSendActions.SendDataToUser(client, 'ROULETTE_REPORT', response);
        delete client.get_report;

        return false;
    }catch(e){
        console.log("Exception get_report ::", e);
    }
}
module.exports.get_start_date = async(sdate, is_filter) => {
    let start = new Date();
    start.setHours(0, 0, 0, 0);
    if(is_filter){
        let time = sdate.split("/");
        start.setDate(Number(time[0]))
        start.setMonth(Number(time[1])-1)
        start.setFullYear(Number(time[2]))
    }
    console.log("start : ", start)
    // const start_timer = await commonClass.AddTimeWithDate(new Date(start), -19800);
    return start;
}
module.exports.get_end_date = async(edate, is_filter) => {
    
    let end = new Date();
    end.setHours(23, 59, 59, 999);
    if(is_filter){
        let time = edate.split("/");
        end.setDate(Number(time[0]))
        end.setMonth(Number(time[1])-1)
        end.setFullYear(Number(time[2]))
    }
    console.log("end : ", end)

    // const end_timer = await commonClass.AddTimeWithDate(new Date(end), -19800);
    return end;
}