var xmlBase = require('./xmlBase.js');
var http = require('http');
var config = require('../configuration.json');

module.exports=function identify(host,res){
  var xmldoc;
  var earliest_datestamp;
  //we get he earliest datstamp
  http.get('http://127.0.0.1:5984/tire-a-part/_design/tire-a-part/_rewrite/oaipmh/earliest_datestamp?descending=false&limit=1',(resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received
    resp.on('end', () => {
      var couchDBdoc = JSON.parse(data);
      console.log(couchDBdoc.rows[0]);
      earliest_datestamp=couchDBdoc.rows[0];
      console.log('date:'+JSON.stringify(earliest_datestamp.value));
      earliest_datestamp=new Date(earliest_datestamp.value).toISOString();
      //we get the configuration from json file

      var repoName= config["nom du repository"];
      var email = config["email administrateur"];


      xmldoc=xmlBase(null,null,host,"Identify");
      xmldoc+='<Identify>'
      xmldoc+='<repositoryName>'+repoName+'</repositoryName>';
    //BASE URL C4ES HOST ???????????
      xmldoc+='<baseURL>'+host+'</baseURL>';
      xmldoc+='<protocolVersion>2.0</protocolVersion>';
      //EMAILADMIN §!!!!!!!!
      for(var i=0;i<email.length;i++){
          xmldoc+= '<adminEmail>'+email[i]+'</adminEmail>';
      }

      xmldoc+='<earliestDatestamp>'+earliest_datestamp+'</earliestDatestamp>';
      xmldoc+='<deletedRecord>no</deletedRecord>';
      xmldoc+='<granularity>YYYY-MM-DDThh:mm:ssZ</granularity>';
      xmldoc+='</Identify></OAI-PMH>';

      res.set('Content-Type', 'application/xml');
      res.send(xmldoc);


    });
  });


}
