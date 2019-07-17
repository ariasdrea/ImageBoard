const fs = require("fs");
const aws = require('aws-sdk');

let secrets;
if (process.env.NODE_ENV == "production") {
    // in prod the secrets are environment variables
    secrets = process.env;
} else {
    secrets = require("./secrets");
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET
});

exports.upload = (req, res, next) => {
    if (!req.file) {
        return res.sendStatus(500);
    }

    const {filename, mimetype, size, path} = req.file;

    s3.putObject({
        Bucket: "arias-imageboard",
        ACL: 'public-read',
        Key: filename,
        Body: fs.createReadStream(path),
        ContentType: mimetype,
        ContentLength: size
    }).promise().then(() => {
        next();
    }).catch(err => {
        console.log('err in s3 promise catch', err);
        res.sendStatus(500);
    }).then(() => fs.unlink(path, () => {}));
};
