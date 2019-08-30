const express = require("express");
const app = express();
const db = require("./db");
// Configurartion for image upload
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
////////////////////////////////
const config = require("./config.json");
const s3 = require("./s3");
const moment = require('moment');

app.use(express.json());
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
    db.getImages()
        .then(results => {
            res.json(results);
        })
        .catch(err => {
            console.log("ERR in GET - images:", err);
        });
});

app.get("/getAllImages", (req, res) => {
    db.getAllImages()
        .then(results => {
            res.json(results);
        })
        .catch(err => {
            console.log("ERR in GET - getAllImages:", err);
        });
});

//(uploader.single('file')) uploads to 'uploads' directory (HD)
//s3.upload - uploads to AWS
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    let { title, description, username } = req.body;
    let url = req.file.filename;
    let fullUrl = config.s3Url + url;

    if (req.file) {
        db.uploadImage(fullUrl, username, title, description)
            .then(result => {
                // db.insertTags(t)
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
    db.getComments(req.params.id)
        .then(result => {
            result.forEach(comment => {
                comment.added = moment(comment.added).format("MMM Do YY");
            });
            res.json(result);
        });
});

app.post("/insert-comment/:id", (req, res) => {
    let { comment, modalUser } = req.body;

    db.insertComment(comment, modalUser, req.params.id)
        .then(result => {
            result.added = moment(comment.added).format("MMM Do YY");
            res.json(result);
        })
        .catch(err => {
            console.log("ERR IN POST -INSERT/COMMENT:", err);
        });
});

app.get("/get-more-images/:id", (req, res) => {
    db.getMoreImages(req.params.id)
        .then(images => {
            res.json(images);
        });
});

app.post('/delete-image/:id', (req, res) => {
    db.deleteImageAndComments(req.params.id)
        .then(() => {
            res.json({
                success: true
            });
        })
        .catch(err => {
            console.log('err in post delete-image: ', err);
        });
});

app.listen(8080, () => console.log("8080 listening!"));
