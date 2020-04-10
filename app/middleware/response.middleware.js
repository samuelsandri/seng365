const errorCodes = [400, 401, 403, 404];

exports.resultIsError = function(result) {
    return errorCodes.includes(result);
};

exports.sendErrorResponse = function(res, result) {
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