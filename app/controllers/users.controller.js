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
    console.log('Request to create new user');

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const city = req.body.city;
    const country = req.body.country;

    try {
        const result = await users.createUser(name, email, password, city, country);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status(201)
                .send(result);
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.loginUser = async function(req, res) {
    console.log('Request to log in user');

    const email = req.body.email;
    const password = req.body.password;

    try {
        const result = await users.loginUser(email, password);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.logoutUser = async function(req, res) {
    console.log('Request to log out user');

    const authToken = req.header("X-Authorization");

    try {
        const result = await users.logoutUser(authToken);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status(200)
                .send('Ok');
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.getUser = async function(req, res) {
    console.log('Request to get user');

    const authToken = req.header("X-Authorization");
    const userId = req.params.id;

    try {
        const result = await users.getUser(userId, authToken);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.updateUser = async function(req, res) {
    console.log('Request to update user');

    const authToken = req.header("X-Authorization");
    const userId = req.params.id;
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const currentPassword = req.body.currentPassword;
    const city = req.body.city;
    const country = req.body.country;

    try {
        const result = await users.updateUser(userId, name, email, password, currentPassword, city, country, authToken);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status(200)
                .send('Ok');
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.getUserPhoto = async function(req, res) {
    console.log('Request to get user photo');

    const userId = req.params.id;

    try {
        const result = await users.getUserPhoto(userId);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status(200)
                .contentType(result.mimeType)
                .send(result.image);
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.setUserPhoto = async function(req, res) {
    console.log('Request to set user photo');

    const authToken = req.header("X-Authorization");
    const userId = req.params.id;
    const contentType = req.header("Content-Type");
    const image = req.body;

    try {
        const result = await users.setUserPhoto(userId, authToken, contentType, image);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else if (result === 200) {
            res.status(200)
                .send('Ok');
        } else {
            res.status(201)
                .send('Created');
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.deleteUserPhoto = async function(req, res) {
    console.log('Request to delete user photo');

    const authToken = req.header("X-Authorization");
    const userId = req.params.id;

    try {
        const result = await users.deleteUserPhoto(userId, authToken);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status(200)
                .send('Ok');
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};