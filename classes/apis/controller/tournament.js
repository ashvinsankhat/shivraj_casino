var dateFormat = require('dateformat');
module.exports.getList= async(req, res) => {
    let tournament_infos = await Tournaments.find({},{});
    console.log("tournament_infos tournament_infos ::", tournament_infos)
    res.render('tournament',{data:tournament_infos,messages : {success : "Record Get Success",error : false}});
}
module.exports.getAddTournament = async(req, res) => {
    let date = dateFormat(new Date(), "mm/dd/yyyy h:MM TT");
    res.render('tournament/add', {
        
        type : "",
        name : "",
        bet: 0,
        max_player: 0,
        register_date: date,
        start_date: date,
        game_type : "",
        game_round : 0,
        game_round_end_timer :0,
        tournament_levels : 0,
        is_repeat :"",
        repeat_type : "",
        repeat_start_time : 0,
        messages : {success : "", error : false }       
    })
}

/*
    {
        type: 'Club',
        name: 'Today play',
        game_type: 'Deal Rummy',
        game_round: '3',
        game_round_end_timer: '20',
        register_date: '01/27/2022 1:58 PM',
        start_date: '01/27/2022 1:58 PM',
        bet: '50',
        max_player: '1700',
        tournament_levels: '5',
        total_pool_price: '85000',
        element_player : [ '3', '300', '800', '1200' ],
        rank: [ '1', '2', '3', '4' ],
        rank_to: [ '0', '0', '0', '5' ],
        amount: [ '15000', '1000', '900', '500' ]
    }

*/
module.exports.addTournament = async(req, res) => {
    console.log("AddTournament req.body : ", req.body);
  
    let type = req.body.type;
    let name = req.body.name;
    let game_type = req.body.game_type;
    let game_round = req.body.game_round;
    let game_round_end_timer = req.body.game_round_end_timer;
    let register_date = req.body.register_date;
    let start_date = req.body.start_date;
    let bet = req.body.bet;
    let max_player = req.body.max_player;
    let tournament_levels = req.body.tournament_levels;
    let total_pool_price = req.body.total_pool_price;
    let element_player = req.body.element_player;
    let rank = req.body.rank;
    let rank_to = req.body.rank_to;
    let amount = req.body.amount;
    
    let is_repeat = req.body.is_repeat;
    let repeat_type = req.body.repeat_type;
    let repeat_start_time = req.body.repeat_start_time;

    
    let errors = false;
    let errorMsg = "";

    if(type == ""){
        errors = true;
        errorMsg = "Please select valid tournament type!"
    }else if(name == ""){
        errors = true;
        errorMsg = "Please select valid tournament name!"
    }else if(game_type == "" || Number(game_round) <= 0 || Number(game_round_end_timer) <= 0 ){
        errors = true;
        errorMsg = "Please check tournament config!"
    }else if(Number(bet) <= 0){
        errors = true;
        errorMsg = "Please enter bet!"
    }else if(Number(max_player) <= 0){
        errors = true;
        errorMsg = "Please enter max user counter!"
    }else if(Number(max_player) <= 0){
        errors = true;
        errorMsg = "Please enter max user counter!"
    }

    let total_amount = 0;
    for(var i = 0 ; i < amount.length; i++){
        total_amount = total_amount + Number(amount[i])
    }
    if(Number(total_amount) >= Number(total_pool_price)){
        errors = true;
        errorMsg = "Please enter proper price pool amount!"
    }
    let repeat = false;
    if(is_repeat == 'on'){
        repeat = true;
        if(repeat_type == "Every Hours"){
            if(Number(repeat_start_time) >= 0){

                start_date = new Date(register_date).setSeconds(new Date(register_date).getSeconds() + (60 * Number(repeat_start_time))) 
            }else{
                errors = true;
                errorMsg = "Please enter proper Start Tournament After Register Time in Minutes!"
            }
        }else if(repeat_type == "Every Minutes"){
            if(Number(repeat_start_time) >= 0){
                start_date = new Date(register_date).setSeconds(new Date(register_date).getSeconds() + ( Number(repeat_start_time)))
            }else{
                errors = true;
                errorMsg = "Please enter proper Start Tournament After Register Time in Seconds!"
            }
        }
    }
    

    if(errors){
        res.render('tournament/add', {
            type : type,
            name : name,
            game_type : game_type,
            game_round : game_round,
            game_round_end_timer : game_round_end_timer,
            register_date : register_date,
            start_date : start_date,
            bet : bet,
            max_player : max_player,
            total_pool_price : total_pool_price,
            element_player : element_player,
            tournament_levels : tournament_levels,
            rank : rank,
            rank_to : rank_to,
            amount : amount,
            is_repeat :is_repeat,
            repeat_type : repeat_type,
            repeat_start_time : repeat_start_time,
            messages : {success : "", error : errorMsg }      
        })
    }

    // if no error
    if(!errors) {

        let price_pool =[];
        for(let  i = Number(rank.length)-1 ; i >= 0 ; i--){
            price_pool.push({
                rank_start : Number(rank[i]),
                rank_end : Number(rank_to[i]),
                total_player : (rank_to[i] == 0)?1:(Number(rank_to[i]) - Number(rank[i])) + 1,
                winning_amount : Number(amount[i]) 
            })
        }
        let round_details =[];
        let round = Number(tournament_levels);
        let price_pool_user_counters = 0;
        for(let  i = 0 ; i < Number(tournament_levels) ; i++){
            round_details.push({
                round : round,
                player_counter : Number(element_player[i]),
            })

            if(i == (tournament_levels - 1))
                price_pool_user_counters  = Number(element_player[i])
                
            round--;
        }
        console.log(price_pool);

        let insert_data = {
            type : type,
            name : name,
            game_type : game_type,
            game_round : game_round,
            game_round_end_timer : game_round_end_timer,
            register_date : register_date,
            start_date : start_date,
            bet : bet,
            max_player : max_player, 
            price_pool : price_pool,
            total_pool_price :total_pool_price,
            price_pool_user_counters : price_pool_user_counters,
            tournament_levels : tournament_levels,
            round_details : round_details,
            is_repeat : repeat,
            repeat_type : repeat_type,

        }
        let tournament_infos = await Tournaments.create(insert_data);
        console.log("tournament_infos : ",tournament_infos)
        res.redirect('/tournament');
    }
}
module.exports.inactiveTournament = async(req, res) => {
    
    console.log("inactiveTournament req.params : ", req.params);
    
    let id = req.params.id;
    let errors = false;

    if(!errors) {
        let wh = {
            _id : id
        };
        let updateData = {
            $set : {
                "is_active" : false
            }
        }
        console.log("inactiveTournament wh: ", wh, updateData);

        let tournament_infos = await Tournaments.findOneAndUpdate(wh, updateData, { new : true });
        console.log("inactiveTournament tournament_infos : ",tournament_infos);
        
        res.redirect('/tournament');
    }
}
module.exports.activeTournament = async(req, res) => {
    
    console.log("activeTournament req.params : ", req.params);
    
    let id = req.params.id;
    let errors = false;

    if(!errors) {
        let wh = {
            _id : id
        };
        let updateData = {
            $set : {
                "is_active" : true
            }
        }
        console.log("activeTournament wh: ", wh, updateData);

        let tournament_infos = await Tournaments.findOneAndUpdate(wh, updateData, { new : true });
        console.log("activeTournament tournament_infos : ",tournament_infos);
        
        res.redirect('/tournament');
    }
}
module.exports.deleteTournament = async(req, res) => {
    
    console.log("deleteTournament req.params : ", req.params);
    
    let id = req.params.id;
    let errors = false;

    if(!errors) {
        let wh = {
            _id : id
        };
        console.log("deleteTournament wh: ", wh);

        let tournament_infos = await Tournaments.deleteOne(wh)
        console.log("deleteTournament tournament_infos : ",tournament_infos);
        
        res.redirect('/tournament');
    }
}
