var xmlBase=require('./xmlBase.js')
//create xml for badArgument error
module.exports=function badArgument(paramJson,host) {
  console.log('entre badarg');
  
  var xmldoc = xmlBase(paramJson,host);
   xmldoc += '<error code="badArgument">need every required parameters</error>';
   xmldoc+= '</OAI-PMH>'
   return xmldoc;
}
