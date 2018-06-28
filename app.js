var path = require('path');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser')
var http = require('http');

var getRecord = require('./src/getRecord.js');
var identify = require('./src/Identify.js');
var listSets = require('./src/ListSets.js');
var listMetadataFormats = require('./src/ListMetadataFormats.js');
var xmlBase = require('./src/xmlBase.js');
var listIdentifiers = require('./src/ListIdentifiers.js');
var listRecords = require('./src/ListRecords.js');

var app = express();

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));


// Log the requests
app.use(logger('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

function handleRequest(req, res) {
    var verb;
    var identifier;
    var metadataPrefix;
    var host = req.get('host');
    var from;
    var until;


    if (req.method == 'GET') {
        verb = req.query.verb;
        identifier = req.query.identifier;
        metadataPrefix = req.query.metadataPrefix;
        from = req.query.from;
        until = req.query.until;
        if (req.query.resumptionToken) {
            var xmldoc = xmlBase(JSON.parse('{}'), host);
            xmldoc += '<error code="badVerb">Illegal OAI verb</error></OAI-PMH>';
            res.set('Content-Type', 'application/xml');
            res.send(xmldoc);
        }
       else if (req.query.set) {
            var xmldoc = xmlBase(JSON.parse('{}'), host);
            xmldoc += '<error code="noSetHierarchy">no set hierarchy</error></OAI-PMH>';
            res.set('Content-Type', 'application/xml');
            res.send(xmldoc);
        }

    } else if (req.method == 'POST') {
        verb = req.body.verb;
        identifier = req.body.identifier;
        metadataPrefix = req.body.metadataPrefix;
    }

    if (verb) {
        console.log('verb ok');
        if (verb === 'GetRecord') {
            console.log('getRecord');
            getRecord(identifier, metadataPrefix, host, res);
        } else if (verb == 'Identify') {
            identify(host, res);
        } else if (verb == 'ListSets') {
            listSets(host, res);
        } else if (verb == 'ListMetadataFormats') {
            listMetadataFormats(host, res, identifier);
        } else if (verb == 'ListIdentifiers') {
            listIdentifiers(metadataPrefix, from, until, host, res);
        } else if (verb == 'ListRecords') {
            listRecords(metadataPrefix, from, until, host, res);
        } else {
            var xmldoc = xmlBase(JSON.parse('{}'), host);
            xmldoc += '<error code="badVerb">Illegal OAI verb</error></OAI-PMH>';
            res.set('Content-Type', 'application/xml');
            res.send(xmldoc);
        }
    } else {
        var xmldoc = xmlBase(JSON.parse('{}'), host);
        xmldoc += '<error code="badVerb">Illegal OAI verb</error></OAI-PMH>';
        res.set('Content-Type', 'application/xml');
        res.send(xmldoc);
    }

}



app.post('/pmh', handleRequest);
app.get('/pmh', handleRequest);

// Route for everything else.
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + '/assets/index.html'));
});

app.listen(3000, function() {
    console.log(`
        ╭─────────────────────────────────────╮
        │                                     │
        │        Server is running on         │
        │        http://127.0.0.1:3000        │
        │                                     │
        ╰─────────────────────────────────────╯
    `);
});
