/* ListSets.js
 * ------
 * Implementation of the OAI-PMH verb 'ListSets'.
 *
 */

var xmlBase = require('./xmlBase.js');

module.exports = function(host, res) {
    var param = '{"verb":"ListSets"}';

    var xmldoc = xmlBase(JSON.parse(param), host);
    xmldoc += '<error code="noSetHierarchy">This repository does not support sets</error></OAI-PMH>';
    res.set('Content-Type', 'application/xml');
    res.send(xmldoc);
}
