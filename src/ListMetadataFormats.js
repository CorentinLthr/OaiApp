/* ListMetadataFormats.js
 * ------
 * Implementation of the OAI-PMH verb 'ListMetadataFormats'.
 *
 */

var xmlBase = require('./xmlBase.js');
var http = require('http');

module.exports = function(host, res, identifier) {
    var xmldoc;
    // If the param identifier does not exist, we simply respond that we only support oai_dc.
    if (!identifier) {
        var param = '{"verb":"ListMetadataFormats"}';
        xmldoc = xmlBase(JSON.parse(param), host);
        xmldoc += '<ListMetadataFormats><metadataFormat><metadataPrefix>oai_dc</metadataPrefix>';
        xmldoc += '<schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema>';
        xmldoc += '<metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace></metadataFormat>';
        xmldoc += '</ListMetadataFormats></OAI-PMH>';
        res.set('Content-Type', 'application/xml');
        res.send(xmldoc);
    // Else, we check if the doc exists. If it indeed exists, we respond oai_dc, else we send an error.
    } else {
        var deb = http.get({
            'host': config["couchdb-server"]["host"],
            'port': config["couchdb-server"]["port"],
            'path': '/tire-a-part/_design/tire-a-part/_view/earliest_datestamp' + endOfUri,
            /*
             * THE FOLLOWING LINE IS FOR COUCHDB AUTHENTICATION (CREDENTIALS IN CONFIG FILE).
             * IF IT IS NOT USED THE LINE SHOULD BE COMMENTED OUT.
             */
            'auth': config["couchdb-server"]["user"] + ":" + config["couchdb-server"]["pass"],
        }, (resp) => {
            let data = '';
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });
            // The whole response has been received.
            resp.on('end', () => {
                // We receive the CouchDB doc and parse it to an object.
                var couchDBdoc = JSON.parse(data);
                console.log("michel" + couchDBdoc);

                // We check if the doc exists, if it doesn't we send an idDoesNotExist error.
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
