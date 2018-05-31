var xmlBase=require('./xmlBase.js');
var badArgument=require('./badArgument.js');
var http=require('http');

module.exports=function(metadataPrefix,from,until,host,res){

	if(!metadataPrefix){
		var param='{';
		var first=true;
		param+='"verb":"ListIdentifiers"';
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
		var param='{"metadataPrefix":"'+metadataPrefix+'"';
		param+=',"verb":"ListIdentifiers"';
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
		param+='"verb":"ListIdentifiers"';
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
		

		var url;
		if(from && until){
			url='http://127.0.0.1:5984/tire-a-part/_design/tire-a-part/_view/earliest_datestamp?startkey='+from+'&endkey='+until;
		}else if(from && !until){
			url='http://127.0.0.1:5984/tire-a-part/_design/tire-a-part/_view/earliest_datestamp?startkey='+from;
		}else if(until && !from){
			url='http://127.0.0.1:5984/tire-a-part/_design/tire-a-part/_view/earliest_datestamp?endkey='+until;
		}else{
			url='http://127.0.0.1:5984/tire-a-part/_design/tire-a-part/_view/earliest_datestamp';
		}

		var deb = http.get(url, (resp) => {
			let data = '';

          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
          	data += chunk;
          });

          // The whole response has been received
          resp.on('end', () => {

            // we receive the couchdb doc and parse it to an object
            var couchDBdoc = JSON.parse(data);
            //we check if the doc exist, if it doeasnt we send an idDoesNotExist error

            if (couchDBdoc.error || couchDBdoc.total_rows==0) {
            	xmldoc+='<error code="noRecordsMatch">pas de record </error></OAI-PMH>';
            	res.set('Content-Type', 'application/xml');
            	res.send(xmldoc);
            }else{
            	var tmsp;
            	xmldoc+='<ListIdentifiers>';
            	for (var row of couchDBdoc.rows){
            		var couchDBdoc=row.value;
            		if(couchDBdoc['DC.issued']){}
            			tmsp = new Date(couchDBdoc['DC.issued'], 1, 1).toISOString();
            		var id = row.id;
            		xmldoc+='<header>';
            		xmldoc+='<identifier>'+id+'</identifier>';
            		xmldoc+='<datestamp>'+tmsp+'</datestamp>';
            		xmldoc+='</header>';
            	}

            }
            xmldoc+='</ListIdentifiers></OAI-PMH>';
            res.set('Content-Type', 'application/xml');
            res.send(xmldoc);
        });




      });

	}
}