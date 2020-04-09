const petitions = require('../models/petitions.model');

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
        res.status( 200 )
            .send( result );
    } catch( err ) {
        res.status( 500 )
            .send( "Internal Server Error" );
    }
};

exports.newPetition = async function(req, res){
    console.log( 'Request to create new petition' );

    const userToken = req.header("X-Authorization");

    const title = req.body.title;
    const description = req.body.description;
    const categoryId = req.body.categoryId;
    const closingDate = req.body.closingDate;

    if (title === undefined || description === undefined || categoryId === undefined) {
        res.status( 400 )
            .send( 'Bad Request' );
    } else {
        try {
            const result = await petitions.newPetition(title, description, categoryId, closingDate, userToken);
            if (result === 0) {
                res.status(401)
                    .send('Unauthorised');
            } else if (result === 1) {
                res.status(400)
                    .send('Bad Request');
            } else {
                res.status(201)
                    .send({petitionId: result});
            }
        } catch (err) {
            res.status(500)
                .send("Internal Server Error");
        }
    }
};

exports.getPetition = async function(req, res){
    console.log("Request to get petition");

    const petitionId = req.params.id;

    try {
        const result = await petitions.getPetition(petitionId);
        if (result.length !== 0) {
            res.status( 200 )
                .send( result );
        } else {
            res.status(404)
                .send("Not Found");
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
        } else {
            res.status(200)
                .send(result);
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
        const result = await petitions.updatePetition(petitionId, userToken);
        if (result === 404) {
            res.status(404)
                .send("Not Found");
        } else if (result === 401) {
            res.status(401)
                .send("Unauthorized");
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
        res.status( 200 )
            .send( result );
    } catch( err ) {
        res.status( 500 )
            .send( "Internal Server Error" );
    }
};

exports.getPetitionPhoto = async function(req, res){
    console.log( 'Request to get petition photo' );

    const petitionId = req.params.id;

    try {
        const result = await petitions.getPetitionPhoto(petitionId);
        if (result === 404) {
            res.status(404)
                .send("Not Found");
        } else {
            res.status(200)
                .contentType(result.mimeType)
                .send(result.image);
        }
    } catch( err ) {
        console.log(err);
        res.status(500)
            .send("Internal Server Error");
    }
};

exports.setPetitionPhoto = async function(req, res){
    return null;
};

exports.getPetitionSignatures = async function(req, res){
    return null;
};

exports.signPetition = async function(req, res){
    return null;
};

exports.removeSignature = async function(req, res){
    return null;
};