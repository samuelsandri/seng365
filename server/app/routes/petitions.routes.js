const petitions = require('../controllers/petitions.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions')
        .get(petitions.getPetitions)
        .post(petitions.newPetition);

    app.route(app.rootUrl + '/petitions/categories')
        .get(petitions.getPetitionCategories);

    app.route(app.rootUrl + '/petitions/:id')
        .get(petitions.getPetition)
        .patch(petitions.updatePetition)
        .delete(petitions.deletePetition);

    app.route(app.rootUrl + '/petitions/:id/photo')
        .get(petitions.getPetitionPhoto)
        .put(petitions.setPetitionPhoto);

    app.route(app.rootUrl + '/petitions/:id/signatures')
        .get(petitions.getPetitionSignatures)
        .post(petitions.signPetition)
        .delete(petitions.removeSignature);
};
