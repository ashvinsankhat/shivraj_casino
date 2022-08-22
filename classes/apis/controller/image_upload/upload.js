module.exports.panUploadImage = async(req, res) => {
    console.log("\nadharUpload :------->" + JSON.stringify(req.body) + " : req.file :--->" + JSON.stringify(req.file));
    var path = req.file.key;
    console.log("adharUpload :id------------>",path);
    var data = {image: path, isUploaded: true}
    res.send(data);
}
module.exports.adharUploadImage = async(req, res) => {
    console.log("\nadharUpload :------->" + JSON.stringify(req.body) + " : req.file :--->" + JSON.stringify(req.file));
    var path = req.file.key;
    console.log("adharUpload :id------------>",path);
    var data = {image: path, isUploaded: true}
    res.send(data);
}