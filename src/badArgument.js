/* badArgument.js
 * -----
 * Generate an XML response for a badArgument type error
 */

var xmlBase = require('./xmlBase.js')

/**
 * badArgument
 * @param {json} paramJson contains the basic info to put int the opening <request>
 */
module.exports = function badArgument(paramJson, host) {
    console.log('Generating a badArgument error');

    var xmldoc = xmlBase(paramJson, host);
    xmldoc += '<error code="badArgument">need every required parameters</error>';
    xmldoc += '</OAI-PMH>'
    return xmldoc;
}
