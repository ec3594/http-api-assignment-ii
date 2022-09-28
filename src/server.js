const http = require('http'); // pull in http module
// url module for parsing url string
const url = require('url');
// querystring module for parsing querystrings from url
const query = require('querystring');
// pull in our custom files
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request, response, handler) => {
    const body = [];

    request.on('error', (err) => {
        console.dir(err);
        response.statusCode = 400;
        response.end();
    });

    request.on('data', (chunk) => {
        body.push(chunk);
    });

    request.on('end', () => {
        const bodyString = Buffer.concat(body).toString();
        const bodyParams = query.parse(bodyString);

        handler(request, response, bodyParams);
    });
};

// handle POST requests
const handlePost = (request, response, parsedUrl) => {
    // If they go to /addUser
    if (parsedUrl.pathname === '/addUser') {
        parseBody(request, response, jsonHandler.addUser);
    }
};

// route the urls to the right functions
const urlStruct = {
    GET: {
        '/': htmlHandler.getIndex,
        '/style.css': htmlHandler.getCSS,
        '/getUsers': jsonHandler.getUsers,
        notFound: jsonHandler.notFound,
    },
    HEAD: {
        '/getUsers': jsonHandler.getUsersMeta,
        notFound: jsonHandler.notFoundMeta,
    },
};

// handle GET and HEAD requests
const handleGetnHead = (request, response, parsedUrl) => {
    if (!urlStruct[request.method]) {
        return urlStruct.HEAD.notFound(request, response);
    }

    if (urlStruct[request.method][parsedUrl.pathname]) {
        return urlStruct[request.method][parsedUrl.pathname](request, response);
    }
    return urlStruct[request.method].notFound(request, response);
};

const onRequest = (request, response) => {
    const parsedUrl = url.parse(request.url);

    // check if method was POST
    if (request.method === 'POST') {
        handlePost(request, response, parsedUrl);
    } else {
        handleGetnHead(request, response, parsedUrl);
    }
};

http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1: ${port}`);
});