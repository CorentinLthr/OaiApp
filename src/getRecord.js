var http = require('http');
var badArgument = require('./badArgument.js');
var xmlBase = require('./xmlBase.js');

module.exports = function(identifier,metadataPrefix,host, res) {
  var xmldoc;
  console.log('verb GetRecord');
  //if there is no identifier we send a badargument error
  if (!identifier) {
    var param;
    param='{';
    var first=true;

    if(metadataPrefix){
      if(!first){
        param+=',';
      }
      param+='"metadataPrefix":"'+metadataPrefix+'"';
      first=false;
    }
    if(!first){
      param+=',';
    }
    param+='"verb":"GetRecord"';
    first=false;
    
    param+='}';
    xmldoc = badArgument(JSON.parse(param),host);

    res.set('Content-Type', 'application/xml');
    res.send(xmldoc);
    //else we check the metadataprefix
  } else {
    console.log('identifier ok');
    //if there are no metadataprefix: again a badargument error
    if (!metadataPrefix) {
      console.log("michel");

      var param;
      param='{';
      var first=true;

      if(!first){
        param+=',';
      }
      param+='"verb":"GetRecord"';
      first=false;
      
      param+='}';
      xmldoc = badArgument(JSON.parse(param),host);

      res.set('Content-Type', 'application/xml');
      res.send(xmldoc);
    } else {
      console.log('metadataprefix ok');
      //we check if the metadataPrefix is oai_dc that is the only one supported as of 20/02/2018
      //if it isn't we send a cannotDisseminateFormat error
      if (!(metadataPrefix === 'oai_dc')) {
        var param='{';
        var first=true;
        if(identifier){
          param+='"identifier":"'+identifier+'"';
          first=false;
        }
        if(metadataPrefix){
          if(!first){
            param+=',';
          }
          param+='"metadataPrefix":"'+metadataPrefix+'"';
          first=false;
        }
        
        if(!first){
          param+=',';
        }
        param+='"verb":"GetRecord"';
        first=false;
        
        param+='}';
        xmldoc = xmlBase(JSON.parse(param),host);
        xmldoc += '<error code="cannotDisseminateFormat">oai_dc is the only supported format</error></OAI-PMH>';
        res.set('Content-Type', 'application/xml');
        res.send(xmldoc);
      } else {
        console.log('oai_dc ok');

        //we query the doc with the couchdb api
        var deb = http.get('http://127.0.0.1:5984/tire-a-part/_design/tire-a-part/_rewrite/oaipmh/' + identifier, (resp) => {
          let data = '';

          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
            data += chunk;
          });

          // The whole response has been received
          resp.on('end', () => {

            // we receive the couchdb doc and parse it to an object
            var couchDBdoc = JSON.parse(data);
            console.log("michel"+couchDBdoc);
            //we check if the doc exist, if it doeasnt we send an idDoesNotExist error

            if (couchDBdoc.error) {
              console.log("toto"+data);

              var param='{';
              var first=true;
              if(identifier){
                param+='"identifier":"'+identifier+'"';
                first=false;
              }
              if(metadataPrefix){
                if(!first){
                  param+=',';
                }
                param+='"metadataPrefix":"'+metadataPrefix+'"';
                first=false;
              }

              if(!first){
                param+=',';
              }
              param+='"verb":"GetRecord"';
              first=false;

              param+='}';

              xmldoc = xmlBase(JSON.parse(param),host);
              xmldoc += '<error code="idDoesNotExist">No matching identifier</error>';
              xmldoc += '</OAI-PMH>';
              res.set('Content-Type', 'application/xml');
              res.send(xmldoc);




            } else {
              console.log("toto"+data);
              console.log("michel"+couchDBdoc);


              var param='{';
              var first=true;
              if(identifier){
                param+='"identifier":"'+identifier+'"';
                first=false;
              }
              if(metadataPrefix){
                if(!first){
                  param+=',';
                }
                param+='"metadataPrefix":"'+metadataPrefix+'"';
                first=false;
              }

              if(!first){
                param+=',';
              }
              param+='"verb":"GetRecord"';
              first=false;

              param+='}';
              // if there are no error we make the xml;
              xmldoc = xmlBase(JSON.parse(param),host);
              //checker si il fau l'uri du doc ou l'id dans couchdb
              xmldoc += '<GetRecord> <record> <header> <identifier>' + identifier + '</identifier>';
              //ici on est censé mettr la date de dernière modif ou creation, on a pas cadans couchdb ???
              // donc on met la date du doc ?
              var tmst;
              if (couchDBdoc.timestamp) {
                tmsp = couchDBdoc.timestamp;
                //if the doc doesnt have a timestamp we put it at the 1st day of the publication year
              } else {
                tmsp = new Date(couchDBdoc['DC.issued'], 1, 1).toISOString();
              }
              xmldoc += '<datestamp>' + tmsp + '</datestamp>';
              xmldoc += '</header>';
              xmldoc += '<metadata>';
              xmldoc += '<oai_dc:dc  xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" ';
              xmldoc += 'xmlns:dc="http://purl.org/dc/elements/1.1/" ';
              xmldoc += 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
              xmldoc += ' xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ ';
              xmldoc += 'http://www.openarchives.org/OAI/2.0/oai_dc.xsd">';


              //we add the metadata in dublin core
              xmldoc += '<dc:title>' + couchDBdoc['DC.title'] + '</dc:title>';
              for (var i = 0; i < couchDBdoc['DC.creator'].length; i++) {
                xmldoc += '<dc:creator>' + couchDBdoc['DC.creator'][i] + '</dc:creator>';
              }
              if (couchDBdoc.abstract) {
                xmldoc += '<dc:description>' + couchDBdoc.abstract + '</dc:description>';
              }
              if (couchDBdoc['DC.issued']) {
                xmldoc += '<dc:date>' + couchDBdoc['DC.issued'] + '</dc:date>';
              }
              if (couchDBdoc['DC.publisher']) {
                xmldoc += '<dc:publisher>' + couchDBdoc['DC.publisher'] + '</dc:publisher>';
              }
              //faire gaffe adresse
              if (couchDBdoc._attachments) {
                xmldoc += '<dc:identifier>http://publications.icd.utt.fr/' + couchDBdoc._id + '/' + Object.keys(couchDBdoc._attachments) + '</dc:identifier>';
                xmldoc += '<dc:format>application/pdf</dc:format>';
              }
              xmldoc += '</oai_dc:dc></metadata></record></GetRecord></OAI-PMH>';


              console.log("doc: " + couchDBdoc);
              console.log("return: " + deb);
              //  doc = js2xmlparser.parse(doc);
              res.set('Content-Type', 'application/xml');
              res.send(xmldoc);
            }
          });
});
}
}
}
}
