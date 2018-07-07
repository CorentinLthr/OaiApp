//filter the text from the record
//we need to adapt text so it can be in xml , for exemple '&' need to become "&;#38;"
//we found that in the couchdb db there are some characters that were changed in the title or description of the doc
//html work with these character but xlm doesnt so we take them out
//an exemple of a doc with changed character : 	263d26f764647350caea81fe33b1f796
module.exports = function(str){
	console.log("filtrage");
	

	str=str.replace(new RegExp("&", 'g'), "&amp;");
	str=str.replace(new RegExp("\n", "g"), "");
	str=str.replace(new RegExp("\u000e", 'g'), '');
	str=str.replace(new RegExp("\u000b", 'g'), "");
	str=str.replace(new RegExp('<', 'g'), '&lt;');
	str=str.replace(new RegExp('>', 'g'), '&gt;');
	str=str.replace(new RegExp('\f', 'g'), 'fi');
	str=str.replace(new RegExp('\u001d', 'g'), '');
	str=str.replace(new RegExp('\u0003', 'g'), '');
	str=str.replace(new RegExp('\u0001', 'g'), '');
	console.log(str);
	return str;
}