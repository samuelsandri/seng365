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
    return null;
};

exports.updatePetition = async function(req, res){
    return null;
};

exports.deletePetition = async function(req, res){
    return null;
};

exports.getPetitionCategories = async function(req, res){
    return null;
};

exports.getPetitionPhoto = async function(req, res){
    return null;
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