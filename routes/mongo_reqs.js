var express = require('express');
var router = express.Router();
const mongo = require("mongodb");
const uri = require("../config/keys").MongoURI;
const client = new mongo.MongoClient(uri,{ useUnifiedTopology: true });

router.get("/download", (req, res) => {
    
    let db = client.db('uploadDB')
    let collection = db.collection('files')
    collection.find({}).toArray((err, doc) => {
        if (err) {
            console.log('err in finding doc:', err)
        }
        else {
            let buffer = doc[0].file.buffer
            fs.writeFileSync('uploadedImage.jpg', buffer)
        }
    })
})


module.exports = router;
