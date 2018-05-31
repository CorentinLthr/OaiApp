var xmlBase = require('./xmlBase.js');

module.exports=function(host,res){
	var par='{"verb":"ListSets"}';

	var xmldoc=xmlBase(JSON.parse(par),host);
	xmldoc+='<error code="noSetHierarchy">This repository does not support sets</error></OAI-PMH>';
	res.set('Content-Type', 'application/xml');
	res.send(xmldoc);
}
