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

    const userQuery = 'SELECT * FROM User u WHERE u.auth_token';
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
    return null;
};

exports.updateUser = async function(userId, name, email, password, currentPassword, city, country, authToken) {
    return null;
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