const petitions = require('../models/petitions.model');

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

exports.getPetitions = async function(req, res){
    console.log( 'Request to get all petitions' );

    const startIndex = req.query.startIndex;
    const count = req.query.count;
    const q = req.query.q;
    const categoryId = req.query.categoryId;
    const authorId = req.query.authorId;
    const sortBy = req.query.sortBy;

    try {
        const result = await petitions.getPetitions(startIndex, count, q, categoryId, authorId, sortBy);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.newPetition = async function(req, res){
    console.log( 'Request to create new petition' );

    const userToken = req.header("X-Authorization");

    const title = req.body.title;
    const description = req.body.description;
    const categoryId = req.body.categoryId;
    const closingDate = req.body.closingDate;

    try {
        const result = await petitions.newPetition(title, description, categoryId, closingDate, userToken);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status(201)
                .send({petitionId: result});
        }
    } catch (err) {
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.getPetition = async function(req, res){
    console.log("Request to get petition");

    const petitionId = req.params.id;

    try {
        const result = await petitions.getPetition(petitionId);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status( 200 )
                .send( result );
        }
    } catch (err) {
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.updatePetition = async function(req, res){
    console.log('Request to update petition');

    const userToken = req.header("X-Authorization");
    const petitionId = req.params.id;

    const title = req.body.title;
    const description = req.body.description;
    const categoryId = req.body.categoryId;
    const closingDate = req.body.closingDate;

    try {
        const result = await petitions.updatePetition(petitionId, title, description, categoryId, closingDate, userToken);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status(200)
                .send('Ok');
        }
    } catch (err) {
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.deletePetition = async function(req, res){
    console.log('Request to delete petition');

    const userToken = req.header("X-Authorization");
    const petitionId = req.params.id;

    try {
        const result = await petitions.deletePetition(petitionId, userToken);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status(200)
                .send("Ok");
        }
    } catch (err) {
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.getPetitionCategories = async function(req, res){
    console.log('Request to get all petition categories');

    try {
        const result = await petitions.getPetitionCategories();
        res.status(200)
            .send(result);
    } catch(err) {
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.getPetitionPhoto = async function(req, res){
    console.log('Request to get petition photo');

    const petitionId = req.params.id;

    try {
        const result = await petitions.getPetitionPhoto(petitionId);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status(200)
                .contentType(result.mimeType)
                .send(result.image);
        }
    } catch( err ) {
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.setPetitionPhoto = async function(req, res){
    console.log('Request to set petition photo');

    const petitionId = req.params.id;
    const userToken = req.header("X-Authorization");
    const contentType = req.header("Content-Type");
    const image = req.body;

    try {
        const result = await petitions.setPetitionPhoto(petitionId, userToken, contentType, image);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else if (result === 200) {
            res.status(200)
                .send("Ok");
        } else {
            res.status(201)
                .send("Created");
        }
    } catch( err ) {
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.getPetitionSignatures = async function(req, res){
    console.log('Request to get petition signatures');

    const petitionId = req.params.id;

    try {
        const result = await petitions.getPetitionSignatures(petitionId);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status(200)
                .send(result);
        }
    } catch( err ) {
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.signPetition = async function(req, res){
    console.log('Request to sign petition');

    const petitionId = req.params.id;
    const userToken = req.header("X-Authorization");

    try {
        const result = await petitions.signPetition(petitionId, userToken);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status(201)
                .send("Created");
        }
    } catch( err ) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.removeSignature = async function(req, res){
    console.log('Request to remove signature from petition');

    const petitionId = req.params.id;
    const userToken = req.header("X-Authorization");

    try {
        const result = await petitions.removeSignature(petitionId, userToken);
        if (await resultIsError(result)) {
            await sendErrorResponse(res, result);
        } else {
            res.status(200)
                .send("Ok");
        }
    } catch( err ) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};