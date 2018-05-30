var xmlBase = require('./xmlBase.js');

module.exports=function(host,res){
  var xmldoc=xmlBase(null,null,host,'ListSets');
  xmldoc+='<error code="noSetHierarchy">This repository does not support sets</error></OAI-PMH>';
  res.set('Content-Type', 'application/xml');
  res.send(xmldoc);
}
