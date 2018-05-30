//create xml that is always at the start of the doc
module.exports=function xmlBase(identifier,metadataPrefix,host,verb) {
  console.log("entre xmlbase");

  var xmldoc = '<?xml version="1.0" encoding="UTF-8"?>';
  xmldoc += '<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" ';
  xmldoc += 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
  // CHECKER ICI LES URI, FAIRE GAFFE AUX ESPACES
  xmldoc += 'xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ ';
  xmldoc += 'http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">';
  var date = new Date().toISOString();

  xmldoc += '<responseDate>' + date + '</responseDate><request ';
  if(verb){
      xmldoc += ' verb="'+verb+ '" ';
  }
  if(identifier){
  xmldoc += ' identifier="' + identifier + '" ';
}
if(metadataPrefix){
  //req.get('host') A VERIFIER, PA SUR
  xmldoc += ' metadataPrefix="' + metadataPrefix+'"' ;
}
xmldoc+= '>' + host+'</request>';
  return xmldoc;
}
