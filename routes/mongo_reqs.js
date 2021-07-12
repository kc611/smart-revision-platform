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


router.post("/upload", (req, res) => {
    // TODO: Allow only PDF Files
    // TODO: Take Author and bookname
    let file = { name: req.body.uploadedFile.name, file: binary(req.files.uploadedFile.data) }

    var currentUser = req.user;
// TODO: Finish this user thingy
    let db = client.db('admin123')
    let collection = db.collection(rerq.body.subject + '_notes')

    try {
        collection.insertOne(file)
        req.flash('success', 'Success');
    }
    catch (err) {
        req.flash('error','Error while inserting:', err)
    }
        
})


module.exports = router;
