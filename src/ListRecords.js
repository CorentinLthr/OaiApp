var xmlBase=require('./xmlBase.js');
var badArgument=require('./badArgument.js');
var http=require('http');

module.exports=function(metadataPrefix,from,until,host,res){

	if(!metadataPrefix){
		console.log("pas metadataPrefix");
		var param='{';
		var first=true;
		param+='"verb":"ListRecords"';
		if(from){
			param+=',"from":"'+from+'"';
			first=false;
		}
		if(until){
			param+=',';
			param+='"until":"'+until+'"';
		}
		param+='}';
		var xmldoc=badArgument(JSON.parse(param),host);
		res.set('Content-Type', 'application/xml');
		res.send(xmldoc);
	}else if(metadataPrefix!='oai_dc'){
		console.log("pas oai_dc");
		var param='{"metadataPrefix":"'+metadataPrefix+'"';
		param+=',"verb":"ListRecords"';
		if(from){
			param+=',';
			param+='"from":"'+from+'"';
		}
		if(until){
			param+=',';
			param+='"until":"'+until+'"';
		}
		param+='}';
		var xmldoc=xmlBase(JSON.parse(param),host);
		xmldoc+='<error code="cannotDisseminateFormat">oai_dc required</error></OAI-PMH>';
		res.set('Content-Type', 'application/xml');
		res.send(xmldoc);
	}else{

		var param='{';
		var xmldoc;
		param+='"verb":"ListRecords"';
		param+=',"metadataPrefix":"oai_dc"';
		if(from){
			param+=',';
			param+='"from":"'+from+'"';
		}
		if(until){
			param+=',';
			param+='"until":"'+until+'"';
		}
		param+='}';
		xmldoc=xmlBase(JSON.parse(param),host);
		if(from){
			from=new Date(from).getFullYear();
		}
		if(until){
			until=new Date(until).getFullYear();
		}

		var url;
		if(from && until){
			url='http://127.0.0.1:5984/tire-a-part/_design/tire-a-part/_view/earliest_datestamp?startkey='+from+'&endkey='+until;
		}else if(from && !until){
			url='http://127.0.0.1:5984/tire-a-part/_design/tire-a-part/_view/earliest_datestamp?startkey='+from;
		}else if(until && !from){
			url='http://127.0.0.1:5984/tire-a-part/_design/tire-a-part/_view/earliest_datestamp?endkey='+until;
		}else{
			url='http://127.0.0.1:5984/tire-a-part/_design/tire-a-part/_view/earliest_datestamp?';
		}
		console.log("url choisie");
		var deb = http.get(url, (resp) => {
			let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
      	data += chunk;
      });

      // The whole response has been received
      resp.on('end', () => {
      	console.log("tout recu");

        // we receive the couchdb doc and parse it to an object
        var couchDBdoc = JSON.parse(data);
        //we check if the doc exist, if it doeasnt we send an idDoesNotExist error
        console.log('total_rows:  '+couchDBdoc.total_rows);
        if (couchDBdoc.error || couchDBdoc.total_rows==couchDBdoc.offset) {
        	xmldoc+='<error code="noRecordsMatch">pas de record </error></OAI-PMH>';
        	res.set('Content-Type', 'application/xml');
        	res.send(xmldoc);
        }else{
        	var tmsp;
        	xmldoc+='<ListRecords>';
        	for (var row of couchDBdoc.rows){
        		var couchDBdoc=row.value;
        		if(couchDBdoc['DC.issued']){
        			tmsp = new Date(couchDBdoc['DC.issued'], 1, 1).toISOString();
        		}
        		var id = row.id;
        		xmldoc+='<record><header>';
        		xmldoc+='<identifier>'+id+'</identifier>';
        		if(couchDBdoc['DC.issued']){xmldoc+='<datestamp>'+tmsp+'</datestamp>';}
        		xmldoc+='</header>';


        		xmldoc += '<metadata>';
        		xmldoc += '<oai_dc:dc  xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" ';
        		xmldoc += 'xmlns:dc="http://purl.org/dc/elements/1.1/" ';
        		xmldoc += 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
        		xmldoc += ' xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ ';
        		xmldoc += 'http://www.openarchives.org/OAI/2.0/oai_dc.xsd">';


          //we add the metadata in dublin core
          xmldoc += '<dc:title>' + couchDBdoc['DC.title'].replace("&","&#38;").replace(new RegExp("&",'g'),"&#38;").replace(new RegExp("\n","g"),"").replace(new RegExp('\u000e', 'g'),'') + '</dc:title>';
          for (var i = 0; i < couchDBdoc['DC.creator'].length; i++) {
          	xmldoc += '<dc:creator>' + couchDBdoc['DC.creator'][i].normalize().replace("&","&#38;").replace(new RegExp("&",'g'),"&#38;").replace(new RegExp("\n","g"),"").replace(new RegExp('\u000e', 'g'),'') + '</dc:creator>';
          }
          if (couchDBdoc.abstract) {
          	xmldoc += '<dc:description>' + couchDBdoc.abstract.replace("&","&#38;").replace(new RegExp("&",'g'),"&#38;").replace(new RegExp("\n","g"),"").replace(new RegExp('\u000e', 'g'),'') + '</dc:description>';
          }
          if (couchDBdoc['DC.issued']) {
          	xmldoc += '<dc:date>' + couchDBdoc['DC.issued'] + '</dc:date>';
          }
          if (couchDBdoc['DC.publisher']) {
          	xmldoc += '<dc:publisher>' + couchDBdoc['DC.publisher'].replace("&","&#38;").replace(new RegExp("&",'g'),"&#38;").replace(new RegExp("\n","g"),"").replace(new RegExp('\u000e', 'g'),'') + '</dc:publisher>';
          }
          //faire gaffe adresse
          if (couchDBdoc._attachments) {
          	xmldoc += '<dc:identifier>http://publications.icd.utt.fr/' + couchDBdoc._id + '/' + (Object.keys(couchDBdoc._attachments)[0]).replace(new RegExp("&",'g'),"&#38;").replace(new RegExp("\n","g"),"").replace(new RegExp('\u000e', 'g'),'') + '</dc:identifier>';
          	xmldoc += '<dc:format>application/pdf</dc:format>';
          }


          xmldoc+='</oai_dc:dc></metadata></record>';
      }

  }
  xmldoc+='</ListRecords></OAI-PMH>';
  res.set('Content-Type', 'application/xml');
  res.send(xmldoc);
});




  });

	}
}