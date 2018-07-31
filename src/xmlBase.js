/* xmlBase.js
 * ------
 * Generate basic XML structure for server responses
 *
 */
 
// Create XML that is always at the start of the doc.
// paramJson contains the list of parameters and their value that should be put at the palace of the X, as in : <request X></request>
// It can be the verb used, the metedataPrefix, the date etc. For more information go to openarchives.org
module.exports = function xmlBase(paramJson, host) {
    console.log("Generating an XML response");

    var xmldoc = '<?xml version="1.0" encoding="UTF-8"?>';
    xmldoc += '<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" ';
    xmldoc += 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';

    xmldoc += 'xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ ';
    xmldoc += 'http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">';
    var date = new Date().toISOString();

    xmldoc += '<responseDate>' + date + '</responseDate><request ';

    Object.keys(paramJson).forEach(function(key) {
        var val = paramJson[key];
        xmldoc += ' ' + key + '="' + val + '"';
    })



    xmldoc += '>' + host + '</request>';
    return xmldoc;
}
