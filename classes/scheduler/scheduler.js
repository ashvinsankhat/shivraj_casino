module.exports.setScheduler = async (jid,timer) => {
    return new Promise((resolve, reject)=>{
        schedule.scheduleJob(jid, new Date(timer), function() {
            schedule.cancelJob(jid);
            resolve(true);
        })
    })
}
module.exports.clearScheduler = async(jid) => {
    return new Promise((resolve, reject)=>{
        schedule.cancelJob(jid);
        resolve(true);
    })
}
module.exports.clearScheduleJob = (tableId, jid) => {
    return new Promise((resolve, reject)=>{
        var sData = { 
            en : 'CLEAR_JOB', 
            data: {
                jid: jid
            }
        };
        
        playExchange.publish('globle.' + tableId, sData);
        resolve(true);
    })
}