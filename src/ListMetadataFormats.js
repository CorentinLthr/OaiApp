/* ListMetadataFormats.js
 * ------
 * Implementation of the OAI-PMH verb 'ListMetadataFormats'.
 *
 */

var xmlBase = require('./xmlBase.js');
var http = require('http');

module.exports = function(host, res, identifier) {
    var xmldoc;
    if (!identifier) {
        var param = '{"verb":"ListMetadataFormats"}';
        xmldoc = xmlBase(JSON.parse(param), host);
        xmldoc += '<ListMetadataFormats><metadataFormat><metadataPrefix>oai_dc</metadataPrefix>';
        xmldoc += '<schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema>';
        xmldoc += '<metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace></metadataFormat>';
        xmldoc += '</ListMetadataFormats></OAI-PMH>';
        res.set('Content-Type', 'application/xml');
        res.send(xmldoc);
    } else {
        var deb = http.get('http://127.0.0.1:5984/tire-a-part/_design/tire-a-part/_rewrite/oaipmh/' + identifier, (resp) => {
            let data = '';
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });
            // The whole response has been received
            resp.on('end', () => {
                // we receive the couchdb doc and parse it to an object
                var couchDBdoc = JSON.parse(data);
                console.log("michel" + couchDBdoc);
                //we check if the doc exist, if it doeasnt we send an idDoesNotExist error

                if (couchDBdoc.error) {
                    var par = '{';
                    var first = true;
                    if (identifier) {
                        par += '"identifier":"' + identifier + '"';
                        first = false;
                    }
                    if (!first) {
                        par += ',';
                    }
                    par += '"verb":"ListMetadataFormats"';
                    par += '}';
                    xmldoc = xmlBase(JSON.parse(par), host);
                    xmldoc += '<error code="idDoesNotExist">No matching identifier</error>';
                    xmldoc += '</OAI-PMH>';
                } else {
                    var par = '{';
                    var first = true;
                    if (identifier) {
                        par += '"identifier":"' + identifier + '"';
                        first = false;
                    }
                    if (!first) {
                        par += ',';
                    }
                    par += '"verb":"ListMetadataFormats"';
                    param += '}';
                    xmldoc = xmlBase(JSON.parse(par), host);
                    xmldoc += '<ListMetadataFormats><metadataFormat><metadataPrefix>oai_dc</metadataPrefix>'
                    xmldoc += '<schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd       </schema>     <metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/ </metadataNamespace> </metadataFormat>';
                    xmldoc += '</ListMetadataFormats></OAI-PMH>';
                }
                res.set('Content-Type', 'application/xml');
                res.send(xmldoc);
            });
        });
    }
}
