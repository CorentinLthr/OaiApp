/* Identify.js
 * ------
 * Implementation of the OAI-PMH verb 'Identify'.
 *
 */

var xmlBase = require('./xmlBase.js');
var http = require('http');
var config = require('../configuration.json');

module.exports = function identify(host, res) {
    var xmldoc;
    var earliest_datestamp;
    

    http.get({
        'host' : config["couchdb-server"]["host"],
        'port' : config["couchdb-server"]["port"],
        'path' : '/tire-a-part/_design/tire-a-part/_view/earliest_datestamp?descending=false&limit=1',
         //IF THERE IS NO IDENTIFICATION ONTHE COUCHDB SERVER THE FOLLOWING LINE SHOULD BE COMMENTED, IF THERE IS, UNCOMMENTED
         // 'auth' : config["couchdb-server"]["user"] + ":" + config["couchdb-server"]["pass"],
    }, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
            console.log('Got data');
        });

        // The whole response has been received
        resp.on('end', () => {
            var couchDBdoc = JSON.parse(data);
            console.log(couchDBdoc.rows[0]);
            earliest_datestamp = couchDBdoc.rows[0];
            //oaipmh require a date in iso format but we only have year so we put the first date at the 1 january of the year
            earliest_datestamp = new Date(JSON.stringify(earliest_datestamp.key)).toISOString();

            // Read the configuration from configuration.json file
            var repoName = config["repository-name"];
            var email = config["admin-email"];

            var param = '{"verb":"Identify"}'
            xmldoc = xmlBase(JSON.parse(param), host);
            xmldoc += '<Identify>'
            xmldoc += '<repositoryName>' + repoName + '</repositoryName>';
           //we put the host as base url but this need to be adapted
           //base url is the url where the harvester will make his request, see oaipmh description for more info
            xmldoc += '<baseURL>' + host + '</baseURL>';
            xmldoc += '<protocolVersion>2.0</protocolVersion>';
           
            for (var i = 0; i < email.length; i++) {
                xmldoc += '<adminEmail>' + email[i] + '</adminEmail>';
            }

            xmldoc += '<earliestDatestamp>' + earliest_datestamp + '</earliestDatestamp>';
            xmldoc += '<deletedRecord>no</deletedRecord>';
            xmldoc += '<granularity>YYYY-MM-DDThh:mm:ssZ</granularity>';
            xmldoc += '</Identify></OAI-PMH>';

            res.set('Content-Type', 'application/xml');
            res.send(xmldoc);


        });
    });


}
