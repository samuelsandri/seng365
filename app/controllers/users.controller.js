const users = require('../models/users.model');

const errorCodes = [400, 401, 403, 404];

resultIsError = async function(result) {
    return errorCodes.includes(result);
};

sendErrorResponse = async function(res, result) {
    if (result === 404) {
        res.status(404)
            .send("Not Found");
    } else if (result === 403) {
        res.status(403)
            .send("Forbidden");
    } else if (result === 400) {
        res.status(400)
            .send("Bad Request");
    } else if (result === 401) {
        res.status(401)
            .send("Unauthorized");
    }
};

exports.createUser = async function(req, res) {
    return null;
};

exports.loginUser = async function(req, res) {
    return null;
};

exports.logoutUser = async function(req, res) {
    return null;
};

exports.getUser = async function(req, res) {
    return null;
};

exports.updateUser = async function(req, res) {
    return null;
};

exports.getUserPhoto = async function(req, res) {
    return null;
};

exports.setUserPhoto = async function(req, res) {
    return null;
};

exports.deleteUserPhoto = async function(req, res) {
    return null;
};