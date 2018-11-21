const express = require("express");
const app = express();
const ca = require("chalk-animation");
const db = require("./db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const config = require("./config.json");
const s3 = require("./s3");

const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.disable("x-powered-by");

// FILE UPLOAD BOILERPLATE//
var diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});
// FILE UPLOAD BOILERPLATE//

app.use(express.static("./public"));
app.use(express.static("./uploads"));

app.get("/images", (req, res) => {
    db.getImages() //queried the database to get images
        .then(results => {
            res.json(results); //res.json takes what we pass it and sends it back to vue
        })
        .catch(err => {
            console.log("ERR in GET - IMAGES:", err);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, function(req, res) {
    let title = req.body.title;
    let description = req.body.description;
    let username = req.body.username;
    let file = req.file; //file we upload
    let url = req.file.filename;
    let fullUrl = config.s3Url + url;

    if (file) {
        db.uploadImage(fullUrl, username, title, description)
            .then(function(result) {
                res.json(result.rows);
            })
            .catch(function(err) {
                console.log("error in uploadimage:", err);
            });
    } else {
        console.log("error in POST UPLOAD");
        res.json({
            success: false
        });
    }
});

app.listen(8080, () => ca.rainbow("listening!"));
