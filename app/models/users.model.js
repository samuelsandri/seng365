const db = require('../../config/db');
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
        const query = 'INSERT INTO User (name, email, password, city, country) VALUES (?, ?, ?, ?, ?)';
        const [result] = await conn.query(query, [name, email, password, city, country]);
        conn.release();
        return {userId: result.insertId};
    }
};

exports.loginUser = async function(email, password) {
    console.log(`Request to log in user`);

    const conn = await db.getPool().getConnection();

    const userQuery = 'SELECT * FROM User u WHERE u.email = ?';
    const [user] = await conn.query(userQuery, [email]);

    if (email === undefined || password === undefined || user.length === 0 || user[0].password !== password) {
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

    if (!email.includes('@') || password === undefined || name === undefined || password === ""
        || name === "" || user.length === 0) {
        conn.release();
        return 400;
    } else if (userRequesting.length === 0 || (password !== currentPassword && user[0].password !== currentPassword)) {
        conn.release();
        return 401;
    } else if ((userWithEmail.length !== 0 && userWithEmail[0].user_id !== userId) || user[0].auth_token !== userRequesting[0].auth_token) {
        conn.release();
        return 403;
    } else {
        const query = 'UPDATE User u SET (name, email, password, city, country) VALUES (?, ?, ?, ?, ?) WHERE u.user_id = ?';
        const [result] = await conn.query(query, [name, email, password, city, country, userId]);
        conn.release();
        return {userId: result.insertId};
    }
};

exports.getUserPhoto = async function(userId) {
    return null;
};

exports.setUserPhoto = async function(userId, authToken, request) {
    return null;
};

exports.deleteUserPhoto = async function(userId, authToken) {
    return null;
};