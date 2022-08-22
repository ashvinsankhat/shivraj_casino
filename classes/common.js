GetRandomString = async (len) => {
    if (typeof(len) != 'undefined') {
        if (len == 10){
            // csl("GetRandomString 111");
            return SERVER_ID + "." + randomString.generate(len)
        }
        else{
            // csl("GetRandomString 222");
            return (randomString.generate(len));
        }
    } else{
        // csl("GetRandomString 333");
        return randomString.generate(32);
    }
}
AddTime = async(t) => {
    //t will be in second how many second you want to add in time.
    let ut = new Date();
    ut.setSeconds(ut.getSeconds() + Number(t));
    return ut;
}
AddTimeWithDate = async(date,t) => {
    //t will be in second how many second you want to add in time.
    let ut = new Date(date);
    ut.setSeconds(ut.getSeconds() + Number(t));
    return ut;
}
AddTimeInMilliseconds = async(t) => {
    let ut = new Date();
    ut.setMilliseconds(ut.getMilliseconds() + Number(t));
    return ut;
}
getTimeDifference = async(startDate, endDate, type)=>{
    let date1 = new Date(startDate);
    let date2 = new Date(endDate);
    let diffMs = (date2 - date1); // milliseconds between now & Christmas
    
    if(type == 'day')
    {
        let date1 = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(),0,0,0);
        let date2 = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(),0,0,0);
        let timeDiff = Math.abs(date2.getTime() - date1.getTime());
        let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        return diffDays;
    }
    else if(type == 'hour')
        return Math.round((diffMs % 86400000) / 3600000); 
    else if(type == 'minute')	
        return Math.round(((diffMs % 86400000) % 3600000) / 60000);
    else
        return Math.round((diffMs / 1000));	
}
getIpAddress = async(client)=>{
    try{
        var ipad = (client.headers['x-forwarded-for'] || '').split(',').pop().trim() ||  client.connection.remoteAddress ||  client.socket.remoteAddress || client.connection.socket.remoteAddress
        var ipad1 = ipad.split(":");
        if(typeof ipad1[3] != 'undefined' && ipad1[3] != null && ipad1[3] != '') {
            return ipad1[3];
        } else {
            return ipad;
        }
    } catch(e){
        console.log("getIpadFromUrl : Exception : ", e);
    }
}
GetRandomInt = (min, max) => { 
    var rnd = Math.floor(Math.random() * (parseInt(max) - parseInt(min) + 1)) + parseInt(min);
    return Number(rnd);	
}
parseJSON = (data) => {
    if(typeof data == 'object') {
        return data;
    }

    try {
        return JSON.parse(data);
    } catch(err) {
        // console.log("parseJSON error : ",err)
        return {};
    }
}
Shuffle = (o) => {
    if(typeof o == 'undefined' || o == null)
    return [];
    
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}
InArray = (needle, haystack) => {
    if(typeof haystack == 'undefined' || haystack == null || needle == null || typeof needle == 'undefined')
        return false;
        
    var length = haystack.length;
    for(var i = 0; i < length; i++) 
    {
        if(haystack[i]!= null && typeof haystack[i] != 'undefined' && haystack[i].toString() == needle.toString())
            return true;
    }
    return false;
}
module.exports = {
    GetRandomString,
    GetRandomInt,
    AddTime,
    AddTimeWithDate,
    AddTimeInMilliseconds,
    getIpAddress,
    getTimeDifference,
    parseJSON,
    Shuffle,
    InArray
}