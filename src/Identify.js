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
    var auth = 'admin:tQgyM2y1mQCA';
    console.log(auth);
    // var auth = 'Basic ' + Buffer.from('admin' + ':' + 'tQgyM2y1mQCA').toString('base64');
    // we get he earliest datestamp
    http.get({
        'host' : '34.229.145.116',
        'port' : '5984',
        'path' : '/tire-a-part/_design/tire-a-part/_view/earliest_datestamp?descending=false&limit=1',
        'auth' : auth,
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
            earliest_datestamp = new Date(JSON.stringify(earliest_datestamp.key)).toISOString();

            // Read the configuration from configuration.json file
            var repoName = config["repository-name"];
            var email = config["admin-email"];

            var param = '{"verb":"Identify"}'
            xmldoc = xmlBase(JSON.parse(param), host);
            xmldoc += '<Identify>'
            xmldoc += '<repositoryName>' + repoName + '</repositoryName>';
            //BASE URL C4ES HOST ???????????
            xmldoc += '<baseURL>' + host + '</baseURL>';
            xmldoc += '<protocolVersion>2.0</protocolVersion>';
            //EMAILADMIN §!!!!!!!!
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
