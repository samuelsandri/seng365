const db = require('../../config/db');
var fs = require('mz/fs');
var mime = require('mime-types');

const photoDirectory = './storage/photos/';

/**
 * Gets all petitions filtered by certain values
 * @param startIndex
 * @param count
 * @param q
 * @param categoryId
 * @param authorId
 * @param sortBy
 * @returns {Promise<*>}
 */
exports.getPetitions = async function(startIndex, count, q, categoryId, authorId, sortBy){
    console.log("Request for petitions from the database");

    const conn = await db.getPool().getConnection();

    // Setup base query
    var query = "SELECT p.petition_id AS petitionId, p.title AS title, c.name AS category, u.name AS authorName, " +
        "COUNT(s.petition_id) AS signatureCount " +
        "FROM Petition p " +
        "LEFT OUTER JOIN Signature s ON p.petition_id = s.petition_id " +
        "JOIN Category c ON p.category_id = c.category_id " +
        "JOIN User u ON p.author_id = u.user_id";
    // Add WHERE clause
    if (q !== undefined || categoryId !== undefined || authorId !== undefined) {
        query += " WHERE";
        if (q !== undefined) {
            query += " p.title LIKE \"%" + q + "%\"";
            if (categoryId !== undefined) {
                query += " AND p.category_id = \"" + categoryId + "\"";
            }
            if (authorId !== undefined) {
                query += " AND p.author_id = \"" + authorId + "\"";
            }
        } else if (categoryId !== undefined) {
            query += " p.category_id = \"" + categoryId + "\"";
            if (authorId !== undefined) {
                query += " AND p.author_id = \"" + authorId + "\"";
            }
        } else {
            query += " p.author_id = \"" + authorId + "\"";
        }
    }
    // Ordering
    if (sortBy === undefined || sortBy === "SIGNATURES_DESC") {
        query += " GROUP BY p.petition_id ORDER BY COUNT(s.petition_id) DESC";
    } else if (sortBy === "ALPHABETICAL_ASC") {
        query += " GROUP BY p.petition_id ORDER BY p.title";
    } else if (sortBy === "ALPHABETICAL_DESC") {
        query += " GROUP BY p.petition_id ORDER BY p.title DESC";
    } else if (sortBy === "SIGNATURES_ASC") {
        query += " GROUP BY p.petition_id ORDER BY COUNT(s.petition_id)";
    }
    // Select specific rows
    if (startIndex !== undefined && count !== undefined) {
        query += " LIMIT " + startIndex + ", " + count;
    } else if (count !== undefined) {
        query += " LIMIT " + count;
    } else if (startIndex !== undefined) {
        query += " LIMIT " + startIndex + ", 18446744073709551615";
    }

    console.log(query);

    const [rows] = await conn.query( query );
    conn.release();

    return rows;
};

/**
 * Creates a new petition using given values
 * @param title
 * @param description
 * @param categoryId
 * @param closingDate
 * @param authToken
 * @returns {Promise<number>}
 */
exports.newPetition = async function(title, description, categoryId, closingDate, authToken){
    console.log("Request to add new petition to the database");

    if (title === undefined || description === undefined || categoryId === undefined) {
        return 400;
    } else {
        let createdDate = new Date(Date.now());
        const conn = await db.getPool().getConnection();

        const queryCategory = 'SELECT c.category_id FROM Category c WHERE c.category_id = ?';
        const [category] = await conn.query(queryCategory, [categoryId]);

        const queryUser = 'SELECT u.user_id FROM User u WHERE u.auth_token = ?';
        const [user] = await conn.query(queryUser, [authToken]);

        if (createdDate > new Date(closingDate) || category.length === 0) {
            conn.release();
            return 400;
        } else if (user.length === 0) {
            conn.release();
            return 401;
        } else {
            const userId = user[0].user_id;
            const query = 'INSERT INTO Petition (title, description, author_id, category_id, created_date, closing_date) VALUES ( ?, ?, ?, ?, ?, ? )';
            const [result] = await conn.query(query, [title, description, userId, categoryId, createdDate, closingDate]);
            conn.release();
            return result.insertId;
        }
    }
};

/**
 * Gets the petition with the given id
 * @param petitionId
 * @returns {Promise<*>}
 */
exports.getPetition = async function(petitionId){
    console.log("Request to get petition from the database");

    const conn = await db.getPool().getConnection();
    const query = 'SELECT p.petition_id AS petitionId, p.title AS title, c.name AS category, u.name AS authorName, ' +
        'COUNT(s.petition_id) AS signatureCount, ' +
        'p.description AS description, p.author_id AS authorId, u.city AS authorCity, ' +
        'u.country AS authorCountry, created_date AS createdDate, closing_date AS closingDate ' +
        'FROM Petition p ' +
        'LEFT OUTER JOIN Signature s ON p.petition_id = s.petition_id ' +
        'JOIN Category c ON p.category_id = c.category_id ' +
        'JOIN User u ON p.author_id = u.user_id ' +
        'WHERE p.petition_id = ? ' +
        'GROUP BY p.petition_id';
    const [result] = await conn.query(query, [petitionId]);
    conn.release();

    if (result.length === 0) {
        return 404;
    } else {
        return result[0];
    }
};

exports.updatePetition = async function(petitionId, title, description, categoryId, closingDate, authToken){
    console.log("Request to update petition in the database");

    let currentDate = new Date(Date.now());
    const conn = await db.getPool().getConnection();

    const queryCategory = 'SELECT c.category_id FROM Category c WHERE c.category_id = ?';
    const [category] = await conn.query(queryCategory, [categoryId]);

    const queryUser = 'SELECT u.user_id FROM User u WHERE u.auth_token = ?';
    const [user] = await conn.query(queryUser, [authToken]);

    const queryPetition = 'SELECT * FROM Petition p WHERE p.petition_id = ?';
    const [petition] = await conn.query(queryPetition, [petitionId]);

    if (petition.length === 0) {
        conn.release();
        return 404; // Not Found
    } else if (user.length === 0) {
        conn.release();
        return 401; // Unauthorized
    } else {
        const oldClosingDate = new Date(petition.closing_date);
        if (currentDate > oldClosingDate || (closingDate !== undefined && currentDate > new Date(closingDate))
            || user[0].user_id !== petition[0].author_id) {
            conn.release();
            return 403; // Forbidden
        } else if (categoryId !== undefined && category.length === 0) {
            conn.release();
            return 400; //Bad Request
        } else {
            const userId = user[0].user_id;

            let first = true;
            let query = 'UPDATE Petition p SET';
            if (title !== undefined) {
                if (first) {
                    first = false;
                } else {
                    query += ','
                }
                query += ' title = "' + title + '"';
            }
            if (description !== undefined) {
                if (first) {
                    first = false;
                } else {
                    query += ','
                }
                query += ' description = "' + description + '"';
            }
            if (categoryId !== undefined) {
                if (first) {
                    first = false;
                } else {
                    query += ','
                }
                query += ' category_id = "' + categoryId + '"';
            }
            if (closingDate !== undefined) {
                if (first) {
                    first = false;
                } else {
                    query += ','
                }
                query += ' closing_date = "' + new Date(closingDate) + '"';
            }

            query += ' WHERE p.petition_id = ?';
            const [result] = await conn.query(query, [petitionId]);

            conn.release();
            return result;
        }
    }
};

exports.deletePetition = async function(petitionId, authToken){
    console.log("Request to delete petition from database");

    const conn = await db.getPool().getConnection();

    const queryUser = 'SELECT u.user_id FROM User u WHERE u.auth_token = ?';
    const [user] = await conn.query(queryUser, [authToken]);

    const queryPetition = 'SELECT * FROM Petition p WHERE p.petition_id = ?';
    const [petition] = await conn.query(queryPetition, [petitionId]);

    conn.release();

    if (petition.length === 0) {
        return 404; // Not Found
    } else if (user.length === 0) {
        return 401; // Unauthorised
    } else {
        const conn2 = await db.getPool().getConnection();
        const query = 'DELETE FROM Petition WHERE petition_id = ?; DELETE FROM Signature WHERE petition_id = ?';
        const [result] = await conn2.query(query, [petitionId, petitionId]);
        conn2.release();
        return result;
    }
};

exports.getPetitionCategories = async function(){
    console.log(`Request to get all petition categories from database`);

    const conn = await db.getPool().getConnection();
    const query = 'SELECT * FROM Category c';
    const [result] = await conn.query(query);
    conn.release();

    return result;
};

exports.getPetitionPhoto = async function(petitionId){
    console.log(`Request to get photo for petition ${petitionId}`);

    const conn = await db.getPool().getConnection();
    const queryPetition = 'SELECT * FROM Petition p WHERE p.petition_id = ?';
    const [petition] = await conn.query(queryPetition, [petitionId]);
    conn.release();

    if (petition.length === 0) {
        return 404; // Not Found
    } else {
        const filename = petition[0].photo_filename;
        if (await fs.exists(photoDirectory + filename)) {
            const image = await fs.readFile(photoDirectory + filename);
            const mimeType = mime.lookup(filename);
            return {image, mimeType};
        } else {
            return 404; // Not Found
        }
    }
};

exports.setPetitionPhoto = async function(petitionId, authToken, contentType, request){
    console.log(`Request to set photo for petition ${petitionId}`);

    const conn = await db.getPool().getConnection();

    const queryUser = 'SELECT u.user_id FROM User u WHERE u.auth_token = ?';
    const [user] = await conn.query(queryUser, [authToken]);

    const queryPetition = 'SELECT * FROM Petition p WHERE p.petition_id = ?';
    const [petition] = await conn.query(queryPetition, [petitionId]);

    conn.release();

    if (petition.length === 0) {
        return 404; // Not Found
    } else if (user.length === 0 || user[0].user_id !== petition[0].author_id) {
        return 401; //Unauthorized
    } else {
        let code;
        if (petition.photo_filename === null) {
            code = 201;
        } else {
            code = 200;
        }
        let imageType;
        if (contentType === "image/jpeg") {
            imageType = ".jpg";
        } else if (contentType === "image/png") {
            imageType = ".png";
        } else {
            imageType = ".gif";
        }
        let filename = "petition_" + petitionId + imageType;
        request.pipe(fs.createWriteStream(photoDirectory + filename));

        const conn2 = await db.getPool().getConnection();
        const query = 'UPDATE Petition p SET photo_filename = ? WHERE p.petition_id = ?';
        const [result] = await conn2.query(query, [filename, petitionId]);
        conn2.release();
        return code;
    }
};

exports.getPetitionSignatures = async function(petitionId){
    console.log(`Request to get signatures for petition ${petitionId}`);

    const conn = await db.getPool().getConnection();
    const queryPetition = 'SELECT * FROM Petition p WHERE p.petition_id = ?';
    const [petition] = await conn.query(queryPetition, [petitionId]);
    conn.release();

    if (petition.length === 0) {
        return 404; // Not Found
    } else {
        const conn2 = await db.getPool().getConnection();
        const query = 'SELECT * FROM Signature s WHERE s.petition_id = ? ORDER BY s.signed_date';
        const [result] = await conn2.query(query, [petitionId]);
        conn2.release();
        return result;
    }
};

exports.signPetition = async function(petitionId, authToken){
    console.log(`Request to sign petition ${petitionId}`);

    const conn = await db.getPool().getConnection();

    const queryPetition = 'SELECT * FROM Petition p WHERE p.petition_id = ?';
    const [petition] = await conn.query(queryPetition, [petitionId]);

    const queryUser = 'SELECT u.user_id FROM User u WHERE u.auth_token = ?';
    const [user] = await conn.query(queryUser, [authToken]);

    conn.release();

    if (petition.length === 0) {
        return 404; // Not Found
    } else if (user.length === 0) {
        return 401; //Unauthorized
    } else {
        let userId = user[0].user_id;
        let currentDate = new Date(Date.now());

        const conn2 = await db.getPool().getConnection();
        const querySignedAlready = 'SELECT * FROM Signature s WHERE s.petition_id = ? AND s.signatory_id = ?';
        const [signedAlready] = await conn2.query(querySignedAlready, [petitionId, userId]);
        conn2.release();

        if (signedAlready.length !== 0 || new Date(petition[0].closing_date) < currentDate) {
            return 403; // Forbidden
        } else {
            const conn3 = await db.getPool().getConnection();
            const query = 'INSERT INTO Signature (signatory_id, petition_id, signed_date) VALUES (?, ?, ?)';
            const [result] = await conn3.query(query, [userId, petitionId, currentDate]);
            conn3.release();
            return result;
        }
    }
};

exports.removeSignature = async function(petitionId, authToken){
    console.log(`Request to remove signature from petition ${petitionId}`);

    const conn = await db.getPool().getConnection();

    const queryPetition = 'SELECT * FROM Petition p WHERE p.petition_id = ?';
    const [petition] = await conn.query(queryPetition, [petitionId]);

    const queryUser = 'SELECT u.user_id FROM User u WHERE u.auth_token = ?';
    const [user] = await conn.query(queryUser, [authToken]);

    conn.release();

    if (petition.length === 0) {
        return 404; // Not Found
    } else if (user.length === 0) {
        return 401; //Unauthorized
    } else {
        let userId = user[0].user_id;
        let currentDate = new Date(Date.now());

        const conn2 = await db.getPool().getConnection();
        const querySignedAlready = 'SELECT * FROM Signature s WHERE s.petition_id = ? AND s.signatory_id = ?';
        const [signedAlready] = await conn2.query(querySignedAlready, [petitionId, userId]);
        conn2.release();

        if (signedAlready.length === 0 || new Date(petition[0].closing_date) < currentDate || petition[0].author_id === userId) {
            return 403; // Forbidden
        } else {
            const conn3 = await db.getPool().getConnection();
            const query = 'DELETE FROM Signature WHERE petition_id = ? AND signatory_id = ?';
            const [result] = await conn3.query(query, [petitionId, userId]);
            conn3.release();
            return result;
        }
    }
};