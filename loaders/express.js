module.exports = (serverType) => {
    /*=========================================================
                Start HTTPS Server
    ===========================================================*/
    app = express();
    router = require('express').Router();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(bodyParser.raw());  
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(gamePath, 'views')));
    console.log("Express module call ",new Date());
    // app.use(express_session);
    // app.get('/', function(req, res) {
    //     // csl('Helloooo !!!!!!! '+ __dirname);
    //     res.send("Helloooo !!!!!!!");
    //     // res.sendFile(__dirname + "/views/index.html");
    // });

    app.get("/crossdomain.xml", function(req, res) {
        res.sendfile("crossdomain.xml");
    });
    csl("Api  Express ..........!",serverType);
    /*app.get('/snapShot', function(req, res){
        playExchange.publish('tablem.*', {en:'snapshots'});
        res.send('OK');
    });*/

    router.get('/captureHeapProfile', async (req, res) => {
        playExchange.publish('tablem.*', {en:'snapshots'});
        res.json({
            msg: "Heap profiles will be written in short time"
        })
    });

    var uptime = new Date();

    var processId = Math.random().toString(36).substr(2, 9).toString();

    app.get("/test", (req, res) => {
        
        res.send("OK");
        // var insData = {
        //     processId: processId,
        //     upTime: uptime,
        //     callTime: new Date()
        // }
        // dbModelClass.insertData("health_check_calls", insData);

    });
    app.get("/RemoveTable", (req, res) => {
        // db.collection('play_table').deleteMany({}, function () {
            res.send("OK");
        // });
    });
    /*=========================================================
            End HTTPS Server starting
    ===========================================================*/
    
}
    