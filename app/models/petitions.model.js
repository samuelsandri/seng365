const db = require('../../config/db');
var fs = require('mz/fs');
var mime = require('mime-types');

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
    var query = "SELECT p.* FROM Petition p LEFT OUTER JOIN Signature s ON p.petition_id = s.petition_id";
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
            query += " AND p.category_id = \"" + categoryId + "\"";
            if (authorId !== undefined) {
                query += " AND p.author_id = \"" + authorId + "\"";
            }
        } else {
            query += " AND p.author_id = \"" + authorId + "\"";
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

    let createdDate = new Date(Date.now());
    const conn = await db.getPool().getConnection();

    const queryCategory = 'SELECT c.category_id FROM Category c WHERE c.category_id = ?';
    const [result3] = await  conn.query(queryCategory, [categoryId]);

    const queryUser = 'SELECT u.user_id FROM User u WHERE u.auth_token = ?';
    const [result] = await conn.query(queryUser, [authToken]);

    conn.release();

    if (createdDate > new Date(closingDate) || result3.length === 0) {
        return 1;
    } else if (result.length !== 0) {
        const userId = result[0].user_id;
        const conn2 = await db.getPool().getConnection();
        const query = 'INSERT INTO Petition (title, description, author_id, category_id, created_date, closing_date) VALUES ( ?, ?, ?, ?, ?, ? )';
        const [result2] = await conn2.query(query, [title, description, userId, categoryId, createdDate, closingDate]);
        conn2.release();
        return result2.insertId;
    } else {
        return 0;
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
    const query = 'SELECT * FROM Petition p WHERE p.petition_id = ?';
    const [result] = await conn.query(query, [petitionId]);
    conn.release();
    return result[0];
};

exports.updatePetition = async function(petitionId, title, description, categoryId, closingDate, authToken){
    console.log("Request to update petition in the database");

    let currentDate = new Date(Date.now());
    const conn = await db.getPool().getConnection();

    const queryCategory = 'SELECT c.category_id FROM Category c WHERE c.category_id = ?';
    const [category] = await  conn.query(queryCategory, [categoryId]);

    const queryUser = 'SELECT u.user_id FROM User u WHERE u.auth_token = ?';
    const [user] = await conn.query(queryUser, [authToken]);

    const queryPetition = 'SELECT * FROM Petition p WHERE p.petition_id = ?';
    const [petition] = await conn.query(queryPetition, [petitionId]);

    conn.release();

    if (petition.length === 0) {
        return 404; // Not Found
    } else {
        const createdDate = new Date(petition.created_date);
        const oldClosingDate = new Date(petition.closing_date);
        if (currentDate > oldClosingDate) {
            return 403; // Forbidden
        } else if (currentDate > new Date(closingDate) || category.length === 0) {
            return 400; //Bad Request
        } else if (user.length !== 0) {
            const userId = user[0].user_id;
            const conn2 = await db.getPool().getConnection();
            const query = 'UPDATE Petition p SET (title, description, author_id, category_id, created_date, closing_date) VALUES ( ?, ?, ?, ?, ?, ? ) WHERE p.petition_id = ?';
            const [result] = await conn2.query(query, [title, description, userId, categoryId, createdDate, closingDate]);
            conn2.release();
            return result;
        } else {
            return 401; // Unauthorised
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
        const query = 'DELETE FROM Petition p WHERE p.petition_id = ?; DELETE FROM Signature s WHERE s.petition_id = ?';
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
        const photosDirectory = './storage/photos/';
        if (await fs.exists(photosDirectory + filename)) {
            const image = await fs.readFile(photosDirectory + filename);
            const mimeType = mime.lookup(filename);
            return {image, mimeType};
        } else {
            return 404; // Not Found
        }
    }
};

exports.setPetitionPhoto = async function(petitionId, authToken){
    console.log(`Request to set photo for petition ${petitionId}`);

    const conn = await db.getPool().getConnection();

    const queryUser = 'SELECT u.user_id FROM User u WHERE u.auth_token = ?';
    const [user] = await conn.query(queryUser, [authToken]);

    const queryPetition = 'SELECT * FROM Petition p WHERE p.petition_id = ?';
    const [petition] = await conn.query(queryPetition, [petitionId]);

    if (petition.length === 0) {
        return 404; // Not Found
    } else if (user.length === 0 || user[0].user_id !== petition.author_id) {
        return 401; //Unauthorized
    }

    conn.release();

};

exports.getPetitionSignatures = async function(){
    return null;
};

exports.signPetition = async function(){
    return null;
};

exports.removeSignature = async function(){
    return null;
};