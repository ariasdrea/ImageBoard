const express = require("express");
const app = express();
const ca = require("chalk-animation");
const db = require("./db");

app.use(express.static("./public"));

app.get("/images", (req, res) => {
    //queried the database to get images
    db.getImages()
        .then(results => {
            console.log("results.rows in db.getImages:", results);
            res.json(results); //res.json takes what we pass it and sends it back to vue
        })
        .catch(err => {
            console.log("ERR in GET - IMAGES:", err);
        });
});

app.listen(8080, () => ca.rainbow("listening!"));
