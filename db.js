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

//query to use for more button - this will give us the total of rows (pictures) that exists in the database. We then compare this number to the images array length to see if they both match.
exports.getAllImages = () => {
    return db.query(
        `SELECT *
        FROM images
        ORDER BY id DESC
        `
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

// gets info for single picture
// exports.getImageInfo = id => {
//     return db.query(
//         `SELECT *
//         FROM images WHERE id = $1`,
//         [id]
//     );
// };


// subquery that gets info for selected, next, and prev picture
exports.getImageInfo = id => {
    return db.query(
        `SELECT *, (
            SELECT min(id) FROM images
            WHERE id > $1
        ) AS "nextId", (
            SELECT max(id) FROM images
            WHERE id < $1
        ) AS "prevId"
        FROM images
        WHERE id = $1`,
        [id]
    ).then(results => {
        return results.rows;
    });
};


exports.getComments = id => {
    return db.query(
        `SELECT *
        FROM comments
        WHERE images_id = $1
        `,
        [id]
    ).then(results => {
        return results.rows;
    });
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
    ).then(result => {
        return result.rows[0];
    });
};

exports.deleteImage = id => {
    return db.query(
        `DELETE FROM images
        WHERE id = $1`,
        [id]
    );
};

exports.deleteComments = () => {
    return db.query(
        `DELETE FROM comments
        WHERE images.id = comments.images_id`
    );
};
