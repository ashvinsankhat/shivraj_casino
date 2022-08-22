const securityActions = require("../encry&decry");
module.exports.SendDataToUser = (client, en, dt, err, errCode, errmsg, title) => {
    if (typeof client != 'undefined' && typeof client == 'object' && typeof client.emit != 'undefined') {
        if (typeof dt == 'undefined' || dt == "" || dt == null) {
            dt = "";
        }
        if (typeof err == 'undefined') {
            err = false;
        }
        if (typeof errmsg == 'undefined') {
            errmsg = "Data delivered successfully.!!";
        }
        if (typeof errCode == 'undefined') {
            errCode = "0000";
        }
        if (typeof title == 'undefined') {
            title = "Alert";
        }
        let data = {
            err: err,
            msg: errmsg,
            errcode: errCode,
            en: en,
            data: dt,
            title: title,
            sendTime: new Date()
        };
        if (en != "HB")
            csl("Response : Event : "+en+" : data : ",JSON.stringify(data));
        
        let eData = securityActions.encrypation(data);
        client.emit('res', eData);
        
        data = null;
        err = null;
        errmsg = null;
        dt = null;
        eData = null;
    }
}
module.exports.SendDataToDirect = (client, en, dt, err, errCode, errmsg, title) => {
    if (typeof client != 'undefined' && client != '' && client != 'Comp'){
        if (typeof dt == 'undefined' || dt == "" || dt == null) {
            dt = "";
        }
        if (typeof err == 'undefined') {
            err = false;
        }
        if (typeof errmsg == 'undefined') {
            errmsg = "";
        }
        if (typeof errCode == 'undefined') {
            errCode = "0000";
        }
        if (typeof title == 'undefined') {
            title = "Alert";
        }

        let data = {
            err: err,
            msg: errmsg,
            errcode: errCode,
            en: en,
            data: dt,
            title: title,
            sendTime: new Date()
        };
        csl("Response : Event : "+en+" : data : ",JSON.stringify(data));

        let eData = securityActions.encrypation(data);

        this.SendAmqpData(client, eData);
        data = null;
        err = null;
        errmsg = null;
        dt = null;
        eData = null;
    }
}
module.exports.SendDataToUidDirect = async(client, en, dt, err,  errCode, errmsg, title) => {
    if (typeof client != 'undefined' && client != '' && client != 'Comp'){
        if (typeof dt == 'undefined' || dt == "" || dt == null) {
            dt = "";
        }
        if (typeof err == 'undefined') {
            err = true;
        }
        if (typeof errmsg == 'undefined') {
            errmsg = "";
        }
        if (typeof errCode == 'undefined') {
            errCode = "0000";
        }
        if (typeof title == 'undefined') {
            title = "Alert";
        }

        let data = {
            flag: err,
            msg: errmsg,
            errorCode: errCode,
            title: title,
            en: en,
            data: dt,
            sendTime: new Date()
        };
        csl("Response : Event : "+en+" : data : ",JSON.stringify(data));

        let eData = securityActions.encrypation(data);
        
        const wh = {
            _id : MongoID(client.toString())
        }
        const project = {
            sck_id : 1
        }

        const userInfo = await GameUser.findOne( wh, project);
        csl("SendDataToUidDirect userInfo : ", userInfo);
        
        this.SendAmqpData(userInfo.sck_id, eData);
        data = null;
        err = null;
        errmsg = null;
        dt = null;
        eData = null;
    }
},
module.exports.SendAmqpData = (uid, dt) => {
    try {
        if (typeof uid == 'undefined' || uid == "" || uid == null || typeof dt == 'undefined' || dt == "" || dt == null) {
            csl("err while sending data to AMQP")
        } else {
            if (typeof io != "undefined" && typeof io.sockets.connected[uid] != 'undefined' && io.sockets.connected[uid]) {
                let eData = dt;
                
                io.sockets.connected[uid].emit('res', eData);
                if(eData.en == "OSR"){
                    io.sockets.connected[uid].disconnect();
                }
            } else {
                playExchange.publish('userm.' + uid, dt); //publishing to exchange
            }
        }
    } catch (e) {
        // console.log("error in send Amqp Data" + e);
        console.log("error in send Amqp Data" + e.stack);
    }
}
module.exports.FireEventToTable = (tb, en, dt, err, errCode, errmsg,  title) => {
    // csl(dataToSend);
    if (typeof tb == 'object') {
        tb = String(tb)
    }
    if (typeof dt == 'undefined' || dt == "" || dt == null) {
        dt = "";
    }
    if (typeof err == 'undefined') {
        err = false;
    }
    if (typeof errmsg == 'undefined') {
        errmsg = "";
    }
    if (typeof errCode == 'undefined') {
        errCode = "0000";
    }
    if (typeof title == 'undefined') {
        title = "Alert";
    }

    let data = {
        err: err,
        msg: errmsg,
        errcode: errCode,
        en: en,
        data: dt,
        title: title,
        sendTime: new Date()
    };
    csl("Response : Event : "+en+" : data : ",JSON.stringify(data));
    
    let eData = securityActions.encrypation(data);
    // csl("Response : eData :" , eData);
    // csl("Response : condition :" , (typeof tb == 'string' && tb.length > 23));

    if (typeof tb == 'string' && tb.length > 23) {
        playExchange.publish('tablem.' + tb, eData);
    }
}
module.exports.SendToAllUser = (tb, en, dt, err, errCode, errmsg,  title) => {
    // csl(dataToSend);
    if (typeof tb == 'object') {
        tb = String(tb)
    }
    if (typeof dt == 'undefined' || dt == "" || dt == null) {
        dt = "";
    }
    if (typeof err == 'undefined') {
        err = false;
    }
    if (typeof errmsg == 'undefined') {
        errmsg = "";
    }
    if (typeof errCode == 'undefined') {
        errCode = "0000";
    }
    if (typeof title == 'undefined') {
        title = "Alert";
    }

    let data = {
        err: err,
        msg: errmsg,
        errcode: errCode,
        en: en,
        data: dt,
        title: title,
        sendTime: new Date()
    };
    csl("Response : Event : "+en+" : data : ",JSON.stringify(data));
    let eData = data;
    playExchange.publish('globle.' + tb, eData);
}