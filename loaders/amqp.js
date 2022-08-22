function connect(serverType) {
    return new Promise(resolve => {
        /*=========================================================
                  RabbitMq server setup start
        ===========================================================*/
        RBMQ_CONFIG = module.exports = {
            host: config.RMQ_HOST,
            login: config.RMQ_LOGIN,
            password: config.RMQ_PASSWORD,
            vhost: config.RMQ_VHOST
        };

        console.log("dev rabbitmq" , RBMQ_CONFIG);
        clientProperties = {
            reconnect: true
        };

        rabbitConn = module.exports = amqp.createConnection(RBMQ_CONFIG);

        rabbitConn.on("error", function(e) {
            // logger.Logger.error("rabbit connection error 22 >> ", e);
            console.log("rabbit connection error 22 ", e);
        });

        rabbitConn.on('close', () => {
            // logger.Logger.error('Publisher connection to AMQP broker closed');
            console.log('Publisher connection to AMQP broker closed');
        });

        // logger.Logger.info("serverString >> ", serverString);
        console.log("serverString >> ", serverString);

        rabbitConn.on("ready", function() {
            // logger.Logger.info("rabbit connected successfully 22.");
            console.log("rabbit connected successfully 22.");
            playExchange = module.exports = rabbitConn.exchange("pe", {
                type: "topic"
            });
            userExchange = module.exports = rabbitConn.exchange("ue", {
                type: "direct",
                autoDelete: false,
                durable: true
            });
            if(serverType == "SOCKET_SERVER"){
                amqpClass.CreateQueues(serverString, serverType);
            }
            resolve();
        });
        /*=========================================================
                RabbitMq server setup finish here
        ===========================================================*/
    })
}
module.exports = {
    connect
}