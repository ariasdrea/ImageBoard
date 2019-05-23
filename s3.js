const knox = require("knox");
const fs = require("fs");

let secrets;

//if credentials live on heroku, then pull those credentials from heroku, else pull them from secrets.json - this prepares you if you run the project online or locally
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // secrets.json is in .gitignore
}

//creates the client that will allow us to talk to Amazon - pass the key/secrets you stored in secrets.json and bucket name
const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: "arias-imageboard"
});

//export this upload function - it will be run as middleware
exports.upload = function(req, res, next) {
    if (!req.file) {
        return res.sendStatus(500);
    }

    const s3Request = client.put(req.file.filename, {
        "Content-Type": req.file.mimetype,
        "Content-Length": req.file.size,
        "x-amz-acl": "public-read"
    });

    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    s3Request.on("response", s3Response => {
        //checking to see if statusCode is 200
        const wasSuccessful = s3Response.statusCode == 200;

        //if successful, next runs and then function in index.js will run (app.pst('/upload'))
        if (wasSuccessful) {
            next();
        } else {
            res.sendStatus(500);
        }
    });
};
