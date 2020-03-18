const db = require('../../config/db');

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

    const conn3 = await db.getPool().getConnection();
    const queryCategory = 'SELECT c.category_id FROM Category c WHERE c.category_id = ?';
    const [result3] = await  conn3.query(queryCategory, [categoryId]);
    conn3.release();

    const conn = await db.getPool().getConnection();
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
    const conn = await db.getPool().getConnection();
    const query = 'SELECT * FROM Petition p WHERE p.petition_id = ?';
    const [result] = await conn.query(query, [petitionId]);
    conn.release();
    return result;
};

exports.updatePetition = async function(){
    return null;
};

exports.deletePetition = async function(){
    return null;
};

exports.getPetitionCategories = async function(){
    return null;
};

exports.getPetitionPhoto = async function(){
    return null;
};

exports.setPetitionPhoto = async function(){
    return null;
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