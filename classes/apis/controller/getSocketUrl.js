// const { getBanners } = require("../../bonusEngine/getBanner");
const GameVersions = require("../../../model/game_versions");
const securityActions = require("../../encry&decry");

module.exports.getSocketurl = async(req, res) => {

    if(typeof req.query.det == "undefined"){
        let json = {
            m_mode:true
        }
        return res.send(securityActions.encrypation(json));
    }
    
    let IP2 = await commonClass.getIpAddress(req);
    let gameConfig  = await this.getGameConfig();
    
    let serverDetails = await this.LoadBalancer();
    csl("serverDetails :", serverDetails);
    if(!serverDetails){
        let json = {
            m_mode:true
        }
        return res.send(securityActions.encrypation(json));
    }
    let json = {
        SOCKET_URL : serverDetails,
        ip : IP2,
        config : gameConfig
    }  
    csl("getSocketurl response :: ", json);
    return res.send(securityActions.encrypation(json));

}
InMaintenanceModeNew = async() => {
    let wh = {
        is_active : true
    }
    let mainInfo = await GameMaintenances.find(wh).sort({ _id : -1 }).limit(5);
    csl("InMaintenanceModeNew mainInfo :: ",mainInfo);

    if (mainInfo.length == 0 || (mainInfo.length > 0 && !mainInfo[0].is_active)){
        let res = {
            MM:false,
            MMSFLAG:false,
            dtdiff:0
        }
        return res;
    }
    mainInfo = mainInfo[0];

    if(
        new Date().getTime() <= new Date(mainInfo.startTime).getTime() && 
        new Date().getTime() <= new Date(mainInfo.endTime).getTime()
    ){
        let dtdiff = await commonClass.getTimeDifference(new Date(), new Date(mainInfo.startTime));
        let res = {
            MM : true,
            MMSFLAG : false,
            dtdiff : dtdiff
        }
        return res;
    }else if(
        new Date().getTime() >= new Date(mainInfo.startTime).getTime() && 
        new Date().getTime() <= new Date(mainInfo.endTime).getTime() 
    ){
        let dtdiff = await commonClass.getTimeDifference(new Date(), new Date(mainInfo.endTime));
        let res = {
            MM : true,
            MMSFLAG : true,
            dtdiff : dtdiff
        }
        return res;
    }else{
        let res = {
            MM : false,
            MMSFLAG : false,
            dtdiff : 0
        }
        return res;
    }

}
gameVersionsTracks = async(data) => {
    let wh = {
        version_type : data.device_type,
        status : true
    } 
    csl("gameVersionsTracks wh :: ", wh);
    
    let updateVersionInfo = await GameVersions.findOne(wh, {});
    csl("gameVersionsTracks updateVersionInfo :",updateVersionInfo);
    
    let res = {
        new_version : (updateVersionInfo != null && typeof updateVersionInfo.version != "undefined" && updateVersionInfo.version != null)?updateVersionInfo.version:0.1,
        ver_msg : (updateVersionInfo != null && typeof updateVersionInfo.msg != "undefined" && updateVersionInfo.msg != null)?updateVersionInfo.msg:"",
        ver_url : (updateVersionInfo != null && typeof updateVersionInfo.apkUrl != "undefined" && updateVersionInfo.apkUrl != null)?config.APK_DOWNLODS_URL+updateVersionInfo.apkUrl:""
    }
    return res;
}
module.exports.getGameConfig = async() => {
    let dt = {};
		
    let ro = ["BU","BASE_URL","S3_URL"];

    for(let k in config){
        if(ro.indexOf(k.toString()) != -1)
            dt[k] = config[k]
    }

    return dt;
}

module.exports.LoadBalancer = async() => {
    return new Promise((resolve,reject)=>{
        redisClient.zscan('servers', 0, 'MATCH',config.SERVER_PREFIX,function (err, servers) {
            if(servers[1].length == 0){
                csl("servers : ",servers);    
                resolve(false);
            }
            redisClient.hgetall(servers[1][0], function (err, finalServer) {
                resolve(finalServer);
            });
        });
    })
}