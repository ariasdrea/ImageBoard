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
        LIMIT 2`
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
        LIMIT 2`,
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

// BONUS FEATURE 1
// query below so that we get the id of the next and previous image in the database (you can do this by writing a subquery)

// exports.getImageInfo = id => {
//     return db.query(
//         `SELECT *, (
//             SELECT id FROM images_id
//             WHERE id > $1
//             LIMIT 1
//         ) AS next_id, (
//             SELECT id FROM images_id
//             WHERE id < $1
//             ORDER BY id DESC
//             LIMIT 1
//         ) AS prev_id
//         FROM images
//         WHERE id = $1`,
//         [id]
//     );
// };

// subquery
// exports.getMoreImages = lastId => {
//     return db
//         .query(
//             `SELECT *, (
//                 SELECT id AS last_id FROM images id = 1
//             )
//         FROM images
//         WHERE id < $1
//         ORDER BY id DESC
//         LIMIT 2`,
//             [lastId]
//         )
//         .then(results => {
//             return results.rows;
//         });
// };
