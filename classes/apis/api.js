const express = require('express')

const { getSocketurl } = require('./controller/getSocketUrl');

const { 
    getList,
    getAddTournament,
    addTournament,
    inactiveTournament,
    activeTournament,
    deleteTournament
} = require('./controller/tournament');

const { 
    panUploadImage,
    adharUploadImage
} = require("./controller/image_upload/upload");

const { 
    getRunningTournament
} = require('./controller/running_tournament');

const {
    paymentSeccuss,
    paymentSeccussNotify
} = require("./controller/cashfree/payment")

const {
    lucky_16_game_config_update
} = require("./controller/admin_api/game_config");
const {
    user_block
} = require("./controller/admin_api/user_block");

const router = express.Router();

router.get('/chooseServer', getSocketurl);


router.get('/socketEventTest', function(req,res){
    res.render('socketEventTest/index');
});
router.get('/', function(req,res){
    res.send('Wellcome to Game Premium League !!');
});

router.get('/tournament/', getList);
router.get('/tournament/add', getAddTournament);
router.post('/tournament/add', addTournament);

router.get('/tournament/inactive/(:id)', inactiveTournament);
router.get('/tournament/active/(:id)', activeTournament);
router.get('/tournament/delete/(:id)', deleteTournament);


router.get('/running_tournament/', getRunningTournament);

var panUpload = multer({
    storage: s3({
        dirname: "pancards",
        bucket: 'rummygameplay',
        secretAccessKey: 'p8c/UrhkiUAZOAOhxrjOPXz6OW5V/CJc6ryb7rzl',
        accessKeyId: 'AKIAWTCC232QGNWHSE2A',
        region: 'ap-south-1',
        filename: function (req, file, cb) {
            let extArray = file.mimetype.split("/");
            console.log("extArary :", extArray);
            let extension = extArray[extArray.length - 1];
            cb(null, "panCard_" + Date.now() + "." + extension);
        }
    })
})
app.post('/panCardUpload', panUpload.single('photos'),panUploadImage);

var adharUpload = multer({
    storage: s3({
        dirname: "adhar",
        bucket: 'rummygameplay',
        secretAccessKey: 'p8c/UrhkiUAZOAOhxrjOPXz6OW5V/CJc6ryb7rzl',
        accessKeyId: 'AKIAWTCC232QGNWHSE2A',
        region: 'ap-south-1',
        filename: function (req, file, cb) {
            let extArray = file.mimetype.split("/");
            console.log("extArary :", extArray);
            let extension = extArray[extArray.length - 1];
            cb(null, "adhar_" + Date.now() + "." + extension);
        }
    })
})
app.post('/adharUpload', adharUpload.single('photos'),adharUploadImage)

router.post('/cashFreeNotify', paymentSeccussNotify);
router.post('/cashFree', paymentSeccuss);

app.get('/update_lucky_16_card_game_config', lucky_16_game_config_update);
app.post('/user_block', user_block);

app.use('/', router);