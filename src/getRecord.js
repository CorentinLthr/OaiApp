/* getRecord.js
 * ------
 * Implementation of the OAI-PMH verb 'getRecord'.
 *
 */

var http = require('http');
var badArgument = require('./badArgument.js');
var xmlBase = require('./xmlBase.js');
var config = require('../configuration.json');
var filter = require('./recordFilter.js');
/**
*generate a record for a precise doc
*@param {number} identifier the identifier of the doc we want the record of
*@param {string} metadataPrefix the metadataprefix we want for the record
*@param {string} the uri  we want to show on the record
*@param {object} res the response object
*/
module.exports = function(identifier, metadataPrefix, host, res) {
    var xmldoc;
    console.log('Detected verb : GetRecord');

    // if there is no identifier, we send a badargument error
    if (!identifier) {
        var param = '{';
        var first = true;

        if (metadataPrefix) {
            if (!first) {
                param += ',';
            }
            param += '"metadataPrefix":"' + metadataPrefix + '"';
            first = false;
        }
        if (!first) {
            param += ',';
        }
        param += '"verb":"GetRecord"';
        first = false;

        param += '}';
        xmldoc = badArgument(JSON.parse(param), host);

        res.set('Content-Type', 'application/xml');
        res.send(xmldoc);
        //else we check the metadataprefix
    } else {
        console.log('[OK] Identifier');
        //if there are no metadataprefix: again a badargument error
        if (!metadataPrefix) {

            var param = '{';
            var first = true;
            if (!first) {
                param += ',';
            }
            param += '"verb":"GetRecord"';
            first = false;

            param += '}';
            xmldoc = badArgument(JSON.parse(param), host);

            res.set('Content-Type', 'application/xml');
            res.send(xmldoc);
        } else {
            console.log('[OK] MetadataPrefix');

            /* We check if the metadataPrefix is oai_dc that is the only one supported as of 20/02/2018
             * If it isn't, we send a cannotDisseminateFormat error */
            if (!(metadataPrefix === 'oai_dc')) {
                var param = '{';
                var first = true;
                if (identifier) {
                    param += '"identifier":"' + identifier + '"';
                    first = false;
                }
                if (metadataPrefix) {
                    if (!first) {
                        param += ',';
                    }
                    param += '"metadataPrefix":"' + metadataPrefix + '"';
                    first = false;
                }

                if (!first) {
                    param += ',';
                }
                param += '"verb":"GetRecord"';
                first = false;

                param += '}';
                xmldoc = xmlBase(JSON.parse(param), host);
                xmldoc += '<error code="cannotDisseminateFormat">oai_dc is the only supported format</error></OAI-PMH>';
                res.set('Content-Type', 'application/xml');
                res.send(xmldoc);
            } else {
                console.log('oai_dc ok');

                //we query the doc with the couchdb api
                http.get({
                    'host' : config["couchdb-server"]["host"],
                    'port' : config["couchdb-server"]["port"],
                    'path' : '/tire-a-part/' + identifier,
                    //IF THERE IS NO IDENTIFICATION ONTHE COUCHDB SERVER THE FOLLOWING LINE SHOULD BE COMMENTED, IF THERE IS, UNCOMMENTED
                    //'auth' : config["couchdb-server"]["user"] + ":" + config["couchdb-server"]["pass"],
                },
               (resp) => {
                    let data = '';

                    // A chunk of data has been recieved.
                    resp.on('data', (chunk) => {
                        data += chunk;
                    });

                    // The whole response has been received
                    resp.on('end', () => {

                        // we receive the couchdb doc and parse it to an object
                        var couchDBdoc = JSON.parse(data);
                        console.log("CouchDB Doc : " + couchDBdoc);
                        //we check if the doc exist, if it doeasnt we send an idDoesNotExist error
                        //if the doc does not exist couchDB.error should exist, and it shoud not exist otherwise
                        if (couchDBdoc.error) {
                            console.log("Data : " + data);
                            //construction of the json parameter for xmlBase()
                            var param = '{';
                            var first = true;
                            if (identifier) {
                                param += '"identifier":"' + identifier + '"';
                                first = false;
                            }
                            if (metadataPrefix) {
                                if (!first) {
                                    param += ',';
                                }
                                param += '"metadataPrefix":"' + metadataPrefix + '"';
                                first = false;
                            }

                            if (!first) {
                                param += ',';
                            }
                            param += '"verb":"GetRecord"';
                            first = false;

                            param += '}';
                            //we use xmlBase to construct the base of the xml doc
                            xmldoc = xmlBase(JSON.parse(param), host);
                            xmldoc += '<error code="idDoesNotExist">No matching identifier</error>';
                            xmldoc += '</OAI-PMH>';
                            res.set('Content-Type', 'application/xml');
                            res.send(xmldoc);




                        } else {
                            console.log("Data : " + data);
                            console.log("CouchDBDoc : " + couchDBdoc);

                            //construction of the json paramter for xmlbase()
                            var param = '{';
                            var first = true;
                            if (identifier) {
                                param += '"identifier":"' + identifier + '"';
                                first = false;
                            }
                            if (metadataPrefix) {
                                if (!first) {
                                    param += ',';
                                }
                                param += '"metadataPrefix":"' + metadataPrefix + '"';
                                first = false;
                            }
                            if (!first) {
                                param += ',';
                            }

                            param += '"verb":"GetRecord"';
                            first = false;
                            param += '}';

                            // if there are no error we make the xml;
                            xmldoc = xmlBase(JSON.parse(param), host);

                            xmldoc += '<GetRecord> <record> <header> <identifier>' + identifier + '</identifier>';
                            //oaiph request the date in iso format but as we only have years (issued) we take the year
                            //and put the date at the 1st of january 
                            var timestamp
                            if (couchDBdoc.timestamp) {
                                timestamp = couchDBdoc.timestamp;
                            } else {
                                timestamp = new Date(couchDBdoc['DC.issued'], 1, 1).toISOString();
                            }
                            xmldoc += '<datestamp>' + timestamp + '</datestamp>';
                            xmldoc += '</header>';
                            xmldoc += '<metadata>';
                            xmldoc += '<oai_dc:dc  xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" ';
                            xmldoc += 'xmlns:dc="http://purl.org/dc/elements/1.1/" ';
                            xmldoc += 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
                            xmldoc += ' xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ ';
                            xmldoc += 'http://www.openarchives.org/OAI/2.0/oai_dc.xsd">';


                            //we add the metadata in dublin core

                            xmldoc += '<dc:title>' + filter(couchDBdoc['DC.title']) + '</dc:title>';
                            for (var i = 0; i < couchDBdoc['DC.creator'].length; i++) {
                                xmldoc += '<dc:creator>' + filter(couchDBdoc['DC.creator'][i])+ '</dc:creator>';
                            }
                            if (couchDBdoc.abstract) {
                                xmldoc += '<dc:description>' + filter(couchDBdoc.abstract)+ '</dc:description>';
                            }
                            if (couchDBdoc['DC.issued']) {
                                xmldoc += '<dc:date>' + couchDBdoc['DC.issued'] + '</dc:date>';
                            }
                            if (couchDBdoc['DC.publisher']) {
                                xmldoc += '<dc:publisher>' + filter(couchDBdoc['DC.publisher'])+ '</dc:publisher>';
                            }
                           
                            if (couchDBdoc._attachments) {
                                console.log("pas filtré:  "+Object.keys(couchDBdoc._attachments)[0]);
                                console.log("filté  "+filter(Object.keys(couchDBdoc._attachments)[0]));
                                xmldoc += '<dc:identifier>http://publications.icd.utt.fr/' + couchDBdoc._id + '/' + filter(Object.keys(couchDBdoc._attachments)[0])+ '</dc:identifier>';
                                xmldoc += '<dc:format>application/pdf</dc:format>';
                            }
                            xmldoc += '</oai_dc:dc></metadata></record></GetRecord></OAI-PMH>';


                            console.log("doc: " + couchDBdoc);

                            
                            res.set('Content-Type', 'application/xml');
                            res.send(xmldoc);
                        }
                    });
                });
            }
        }
    }
}
