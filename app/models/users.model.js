const db = require('../../config/db');
var fs = require('mz/fs');
var mime = require('mime-types');

const photoDirectory = './storage/photos/';

exports.createUser = async function(name, email, password, city, country) {
    return null;
};

exports.loginUser = async function(email, password) {
    return null;
};

exports.logoutUser = async function(email, password, authToken) {
    return null;
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