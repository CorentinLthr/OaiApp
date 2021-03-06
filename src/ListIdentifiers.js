/* ListIdentifiers.js
 * ------
 * Implementation of the OAI-PMH verb 'ListIdentifiers'.
 *
 */
var xmlBase = require('./xmlBase.js');
var badArgument = require('./badArgument.js');
var http = require('http');
var config = require('../configuration.json');

module.exports = function(metadataPrefix, from, until, host, res) {

    if (!metadataPrefix) {
        var param = '{';
        var first = true;
        param += '"verb":"ListIdentifiers"';
        if (from) {
            param += ',"from":"' + from + '"';
            first = false;
        }
        if (until) {
            param += ',';
            param += '"until":"' + until + '"';
        }
        param += '}';
        var xmldoc = badArgument(JSON.parse(param), host);
        res.set('Content-Type', 'application/xml');
        res.send(xmldoc);
    } else if (metadataPrefix != 'oai_dc') {

        var param = '{"metadataPrefix":"' + metadataPrefix + '"';
        param += ',"verb":"ListIdentifiers"';
        if (from) {
            param += ',';
            param += '"from":"' + from + '"';
        }
        if (until) {
            param += ',';
            param += '"until":"' + until + '"';
        }
        param += '}';
        var xmldoc = xmlBase(JSON.parse(param), host);
        xmldoc += '<error code="cannotDisseminateFormat">oai_dc required</error></OAI-PMH>';
        res.set('Content-Type', 'application/xml');
        res.send(xmldoc);
    } else {
        console.log('metadataPrefix: oai_dc');
        var param = '{';
        var xmldoc;
        param += '"verb":"ListIdentifiers"';
        param += ',"metadataPrefix":"oai_dc"';
        if (from) {
            param += ',';
            param += '"from":"' + from + '"';
        }
        if (until) {
            param += ',';
            param += '"until":"' + until + '"';
        }
        param += '}';
        xmldoc = xmlBase(JSON.parse(param), host);
        if (from) {
            from = new Date(from).getFullYear()
        }
        if (until) {
            until = new Date(until).getFullYear()
        }

        /* If the parameters from and until exist, we adapt the URI of the couchdb request.
         * The CouchDB view earliest_datestamp gives all the docs with all the info. The key is the issued year.
         */
        var endOfUri='';
        if (from && until) {
            endOfUri = '?startkey=' + from + '&endkey=' + until;
        } else if (from && !until) {
            endOfUri = '?startkey=' + from;
        } else if (until && !from) {
            endOfUri = '?endkey=' + until;
        }
        console.log({
            'host' : config["couchdb-server"]["host"],
            'port' : config["couchdb-server"]["port"],
            'path' : '/tire-a-part/_design/tire-a-part/_view/earliest_datestamp' + endOfUri,
            /*
             * THE FOLLOWING LINE IS FOR COUCHDB AUTHENTICATION (CREDENTIALS IN CONFIG FILE).
             * IF IT IS NOT USED THE LINE SHOULD BE COMMENTED OUT.
             */
            'auth' : config["couchdb-server"]["user"] + ":" + config["couchdb-server"]["pass"],
        });
        var deb = http.get({
            'host' : config["couchdb-server"]["host"],
            'port' : config["couchdb-server"]["port"],
            'path' : '/tire-a-part/_design/tire-a-part/_view/earliest_datestamp' + endOfUri,
            /*
             * THE FOLLOWING LINE IS FOR COUCHDB AUTHENTICATION (CREDENTIALS IN CONFIG FILE).
             * IF IT IS NOT USED THE LINE SHOULD BE COMMENTED OUT.
             */
            'auth' : config["couchdb-server"]["user"] + ":" + config["couchdb-server"]["pass"],
        }, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received
            resp.on('end', () => {
                // we receive the couchdb doc and parse it to an object
                var couchDBdoc = JSON.parse(data);
                

				//we check if the doc exist, if it doesnt, we send an idDoesNotExist error
                console.log('total_rows:  ' + couchDBdoc.total_rows);
                if (couchDBdoc.error || couchDBdoc.total_rows == couchDBdoc.offset) {
                    xmldoc += '<error code="noRecordsMatch">pas de record </error></OAI-PMH>';
                    res.set('Content-Type', 'application/xml');
                    res.send(xmldoc);
                } else {
                    var tmsp;
                    xmldoc += '<ListIdentifiers>';
                    for (var row of couchDBdoc.rows) {
                        var couchDBdoc = row.value;
                        if (couchDBdoc['DC.issued']) {}
                        
                        tmsp = new Date(couchDBdoc['DC.issued'], 1, 1).toISOString();
                        var id = row.id;
                        xmldoc += '<header>';
                        xmldoc += '<identifier>' + id + '</identifier>';
                        xmldoc += '<datestamp>' + tmsp + '</datestamp>';
                        xmldoc += '</header>';
                    }
                    xmldoc += '</ListIdentifiers></OAI-PMH>';
                res.set('Content-Type', 'application/xml');
                res.send(xmldoc);

                }
                
            });
        });
    }
}
