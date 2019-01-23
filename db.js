const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

exports.getImages = () => {
    return db.query(
        `SELECT *
        FROM images
        ORDER BY id DESC
        LIMIT 3`
    );
};

exports.uploadImage = (url, username, title, description) => {
    return db.query(
        `INSERT INTO images (url, username, title, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
        [url || null, username || null, title || null, description || null]
    );
};

exports.getImageInfo = id => {
    return db.query(
        `SELECT *
        FROM images WHERE id = $1`,
        [id]
    );
};

exports.getComments = id => {
    return db.query(
        `SELECT *
        FROM comments
        WHERE images_id = $1
        `,
        [id]
    );
};

exports.getMoreImages = lastId => {
    return db
        .query(
            `SELECT *
        FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 3`,
            [lastId]
        )
        .then(results => {
            return results.rows;
        });
};

exports.insertComment = (comment, modalUser, images_id) => {
    return db.query(
        `INSERT INTO comments (comment, modalUser, images_id)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [comment, modalUser, images_id]
    );
};
