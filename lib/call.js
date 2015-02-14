var request = require('request');

var ERROR_CODES = {
    METHOD_MUST_BE_POST: 'Batch call method must be POST',
    BODY_MUST_BE_OBJECT: 'Request must be a JSON object'
};

var performBatch = function (batchRes, data) {
    batchRes.writeHead(200, {'Content-Type': 'application/json'});
    var result = {};
    var dataKeys = Object.keys(data);
    dataKeys.forEach(function (dataKey) {
        request(data[dataKey], function (err, res, body) {
            result[dataKey] = {
                err: err,
                body: body,
                headers: res.headers
            };
            if (Object.keys(result).length === dataKeys.length) {
                batchRes.end(JSON.stringify(result));
            }
        });
    });
};

var middleware = function (req, res, next) {
    if (req.method !== 'POST') {
        return next(ERROR_CODES.METHOD_MUST_BE_POST);
    }
    var body = '';
    req.on('data', function (data) {
        body += data;
        if (body.length > 1000000)
            req.connection.destroy();
    });
    req.on('end', function () {
        var result = null;
        try {
            result = JSON.parse(body);
        } catch (e) {}
        if (!result || typeof result !== 'object') {
            return next(ERROR_CODES.BODY_MUST_BE_OBJECT);
        }
        performBatch(res, result);
    });
};

middleware.ERROR_CODES = ERROR_CODES;

module.exports = middleware;