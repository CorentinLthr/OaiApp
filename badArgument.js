var xmlBase=require('./xmlBase.js')
//create xml for badArgument error
module.exports=function badArgument(identifier,metadataPrefix,host,verb) {
  console.log('entre badarg');
  var xmldoc = xmlBase(identifier,metadataPrefix,host,verb);
   xmldoc += '<error code="badArgument">need every required parameters</error>';
   xmldoc+= '</OAI-PMH>'
   return xmldoc;
}
