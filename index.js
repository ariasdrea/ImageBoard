const express = require("express");
const app = express();
const ca = require("chalk-animation");
const db = require("./db");
///// Configurartion for image upload /////
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
//////////////////////////////////////////
const config = require("./config.json");
const s3 = require("./s3");
const moment = require('moment');

const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.disable("x-powered-by");

////////// FILE UPLOAD BOILERPLATE ////////
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
//////////////////////////////////////////

app.use(express.static("./public"));
app.use(express.static("./uploads"));

app.get("/images", (req, res) => {
    db.getImages() //gets 3 images
        .then(results => {
            // console.log("results in get images:", results);
            res.json(results);
        })
        .catch(err => {
            console.log("ERR in GET - images:", err);
        });
});

app.get("/getAllImages", (req, res) => {
    db.getAllImages() //gets all images
        .then(results => {
            // console.log("results in get images:", results);
            res.json(results);
        })
        .catch(err => {
            console.log("ERR in GET - getAllImages:", err);
        });
});

//middleware function (uploader.single('file')) uploads to 'uploads' directory (HD)
//s3.upload - is for uploading the file to AWS
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    let title = req.body.title;
    let description = req.body.description;
    let username = req.body.username;
    let file = req.file; //file we upload
    let url = req.file.filename;
    let fullUrl = config.s3Url + url;

    // console.log("req.file in POST/upload:", req.file);
    if (file) {
        db.uploadImage(fullUrl, username, title, description)
            .then(result => {
                res.json(result.rows);
            })
            .catch(err => {
                console.log("error in uploadimage:", err);
            });
    } else {
        res.json({
            success: false
        });
    }
});

app.get("/get-image-info/:id", (req, res) => {
    db.getImageInfo(req.params.id)
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log("ERR IN GET-IMAGE INFO:", err);
        });
});

app.get("/get-comments/:id", (req, res) => {
    db.getComments(req.params.id).then(result => {
        result.forEach(comment => {
            comment.added = moment(comment.added).format("MMM Do YY");
        });
        res.json(result);
    });
});

app.post("/insert-comment/:id", (req, res) => {
    //if req.body evaluates to {}, check body parser
    let comment = req.body.comment;
    let modalUser = req.body.modalUser;
    let id = req.params.id;

    db.insertComment(comment, modalUser, id)
        .then(result => {
            result.added = moment(comment.added).format("MMM Do YY");
            res.json(result);
        })
        .catch(err => {
            console.log("ERR IN POST -INSERT/COMMENT:", err);
        });
});

app.get("/get-more-images/:id", (req, res) => {
    db.getMoreImages(req.params.id).then(images => {
        res.json(images);
    });
});

// app.post('/delete-image/:id', (req, res) => {
//     db.deleteImage(req.params.id).then().catch(err => {
//         console.log('err in post delete-image: ', err);
//     });
// });

app.listen(8080, () => ca.rainbow("8080 listening!"));
