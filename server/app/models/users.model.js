const db = require('../../config/db');
const passwords = require('../utility/passwords.utility');
var fs = require('mz/fs');
var mime = require('mime-types');

const photoDirectory = './storage/photos/';

exports.createUser = async function(name, email, password, city, country) {
    console.log(`Request to create a new user`);

    const conn = await db.getPool().getConnection();

    const userQuery = 'SELECT * FROM User u WHERE u.email = ?';
    const [user] = await conn.query(userQuery, [email]);

    if (!email.includes('@') || password === undefined || name === undefined || password === ""
        || name === "" || user.length !== 0) {
        conn.release();
        return 400;
    } else {
        const hashedPassword = await passwords.hash(password);
        const query = 'INSERT INTO User (name, email, password, city, country) VALUES (?, ?, ?, ?, ?)';
        const [result] = await conn.query(query, [name, email, hashedPassword, city, country]);
        conn.release();
        return {userId: result.insertId};
    }
};

exports.loginUser = async function(email, password) {
    console.log(`Request to log in user`);

    const conn = await db.getPool().getConnection();

    const userQuery = 'SELECT * FROM User u WHERE u.email = ?';
    const [user] = await conn.query(userQuery, [email]);

    if (email === undefined || password === undefined || user.length === 0
        || !(await passwords.compare(password, user[0].password))) {
        conn.release();
        return 400;
    } else {
        const userId = user[0].user_id;
        const token = Math.random().toString(36).substr(2);

        const addTokenQuery = 'UPDATE User u SET auth_token = ? WHERE user_id = ?';
        const result = conn.query(addTokenQuery, [token, userId]);
        conn.release();

        return {userId: userId, token: token};
    }
};

exports.logoutUser = async function(authToken) {
    console.log(`Request to log out user`);

    const conn = await db.getPool().getConnection();

    const userQuery = 'SELECT * FROM User u WHERE u.auth_token = ?';
    const [user] = await conn.query(userQuery, [authToken]);

    if (user.length === 0) {
        conn.release();
        return 401;
    } else {
        const userId = user[0].user_id;
        const addTokenQuery = 'UPDATE User u SET auth_token = null WHERE user_id = ?';
        const result = conn.query(addTokenQuery, [userId]);
        conn.release();
        return 200;
    }
};

exports.getUser = async function(userId, authToken) {
    console.log(`Request to get user ${userId}`);

    const conn = await db.getPool().getConnection();
    const userQuery = 'SELECT name, email, city, country, auth_token FROM User u WHERE u.user_id = ?';
    const [user] = await conn.query(userQuery, [userId]);
    conn.release();

    if (user.length === 0) {
        return 404;
    } else if (user[0].auth_token === authToken) {
        return {name: user[0].name, email: user[0].email, city: user[0].city, country: user[0].country};
    } else {
        return {name: user[0].name, city: user[0].city, country: user[0].country};
    }
};

exports.updateUser = async function(userId, name, email, password, currentPassword, city, country, authToken) {
    console.log(`Request to update user ${userId}`);

    const conn = await db.getPool().getConnection();

    const userQuery = 'SELECT * FROM User u WHERE u.user_id = ?';
    const [user] = await conn.query(userQuery, [userId]);

    const userRequestingQuery = 'SELECT * FROM User u WHERE u.auth_token = ?';
    const [userRequesting] = await conn.query(userRequestingQuery, [authToken]);

    const userWithEmailQuery = 'SELECT * FROM User u WHERE u.email = ?';
    const [userWithEmail] = await conn.query(userWithEmailQuery, [email]);

    let first = true;
    let updateQuery = 'UPDATE User u SET';
    let addToQuery = function (first, query, attr, val) {
        if (val !== undefined) {
            if (first) {
                first = false;
            } else {
                query += ',';
            }
            query += ' ' + attr + ' = "' + val + '"';
        }
        return [first, query];
    };
    [first, updateQuery] = addToQuery(first, updateQuery, 'name', name);
    [first, updateQuery] = addToQuery(first, updateQuery, 'email', email);
    [first, updateQuery] = addToQuery(first, updateQuery, 'city', city);
    [first, updateQuery] = addToQuery(first, updateQuery, 'country', country);
    updateQuery += ' WHERE u.user_id = ?';

    if ((email !== undefined && !email.includes('@')) || user.length === 0 || first) {
        conn.release();
        return 400; // Bad request
    } else if (userRequesting.length === 0 || (password !== undefined && password !== currentPassword && !(await passwords.compare(currentPassword, user[0].password)))) {
        conn.release();
        return 401; // Unauthorized
    } else if ((userWithEmail.length !== 0 && userWithEmail[0].user_id !== userId) || user[0].auth_token !== userRequesting[0].auth_token) {
        conn.release();
        return 403; // Forbidden
    } else {
        const [result] = await conn.query(updateQuery, [userId]);
        conn.release();
        return {userId: result.insertId};
    }
};

exports.getUserPhoto = async function(userId) {
    console.log(`Request to get photo for user ${userId}`);

    const conn = await db.getPool().getConnection();
    const queryUser = 'SELECT * FROM User u WHERE u.user_id = ?';
    const [user] = await conn.query(queryUser, [userId]);
    conn.release();

    if (user.length === 0) {
        return 404; // Not Found
    } else {
        const filename = user[0].photo_filename;
        if (await fs.exists(photoDirectory + filename)) {
            const image = await fs.readFile(photoDirectory + filename);
            const mimeType = mime.lookup(filename);
            return {image, mimeType};
        } else {
            return 404; // Not Found
        }
    }
};

exports.setUserPhoto = async function(userId, authToken, contentType, image) {
    console.log(`Request to set photo for user ${userId}`);

    const conn = await db.getPool().getConnection();

    const queryUser = 'SELECT * FROM User u WHERE u.user_id = ?';
    const [user] = await conn.query(queryUser, [userId]);
    const userRequestingQuery = 'SELECT * FROM User u WHERE u.auth_token = ?';
    const [userRequesting] = await conn.query(userRequestingQuery, [authToken]);

    conn.release();

    if (user.length === 0) {
        return 404;
    } else if (userRequesting.length === 0) {
        return 401;
    } else if (user[0].user_id !== userRequesting[0].user_id) {
        return 403;
    } else if (contentType !== "image/jpeg" && contentType !== "image/png" && contentType !== "image/gif") {
        return 400;
    } else {
        let imageType = '.' + contentType.slice(6);
        let filename = "user_" + userId + imageType;
        fs.writeFile(photoDirectory + filename, image);

        const conn2 = await db.getPool().getConnection();
        const query = 'UPDATE User u SET photo_filename = ? WHERE u.user_id = ?';
        const [result] = await conn2.query(query, [filename, userId]);
        conn2.release();

        if (user[0].photo_filename === null) {
            return 201;
        } else {
            return 200;
        }
    }
};

exports.deleteUserPhoto = async function(userId, authToken) {
    console.log(`Request to delete photo for user ${userId}`);

    const conn = await db.getPool().getConnection();

    const queryUser = 'SELECT * FROM User u WHERE u.user_id = ?';
    const [user] = await conn.query(queryUser, [userId]);
    const userRequestingQuery = 'SELECT * FROM User u WHERE u.auth_token = ?';
    const [userRequesting] = await conn.query(userRequestingQuery, [authToken]);

    conn.release();

    if (user.length === 0) {
        return 404;
    } else if (userRequesting.length === 0) {
        return 401;
    } else if (user[0].user_id !== userRequesting[0].user_id) {
        return 403;
    } else {
        const conn2 = await db.getPool().getConnection();
        const query = 'UPDATE User u SET photo_filename = null WHERE u.user_id = ?';
        const [result] = await conn2.query(query, [userId]);
        conn2.release();
        return 200;
    }
};