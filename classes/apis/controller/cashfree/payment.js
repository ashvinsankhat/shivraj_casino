const {
    successPayment
} = require("../../../deposit/requestHandle")


module.exports.paymentSeccussNotify = async(req, res) => {
    try{
        csl("cashFreeNotify  : req : ",req.body);
        let data = req.body;
        res.send("Ok");
        
    }catch (e) {
        csl("cashWithdraw : 1 : Exception :",e)
        res.send('Forbidden', 403);
    }
}
module.exports.paymentSeccuss = async(req, res) => {
    try{
        csl("cashFreeNotify  : req : ",req.body);
        let data = req.body;
        if(typeof data.orderId != "undefined" && data.orderId != ""){

            var wh = { orderId: data.orderId};
            csl("cashFreeNotify : wh : ",JSON.stringify(wh))
          
            let wh1 = {
                deposit_id : data.orderId,
            }
            csl("saccessPayment wh1 : ", wh1);

            let depositInfo = await DepositTracks.findOne(wh1, {});
            csl("saccessPayment depositInfo : ", depositInfo);

            if(depositInfo != null){
                await successPayment(data, {_id : depositInfo.user_id});
            }
        }
        res.send("Ok");
        
    }catch (e) {
        csl("cashWithdraw : 1 : Exception :",e)
        res.send('Forbidden', 403);
    }
}