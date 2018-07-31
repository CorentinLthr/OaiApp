/* Filters the text from the record.
 * We need to adapt text so it can be in XML, for instance '&' needs to become "&;#38;"
 * We found that in the CouchDB database, some characters were changed in the title or description of the doc.
 * HTML works with these characters but XML doesn't, so we need to take them out.
 * --
 * Example of a doc with changed character : 263d26f764647350caea81fe33b1f796
 */

module.exports = function (str) {
    console.log("filtrage");

    str = str.replace(new RegExp("&", 'g'), "&amp;");
    str = str.replace(new RegExp("\n", "g"), "");
    str = str.replace(new RegExp("\u000e", 'g'), '');
    str = str.replace(new RegExp("\u000b", 'g'), "");
    str = str.replace(new RegExp('<', 'g'), '&lt;');
    str = str.replace(new RegExp('>', 'g'), '&gt;');
    str = str.replace(new RegExp('\f', 'g'), 'fi');
    str = str.replace(new RegExp('\u001d', 'g'), '');
    str = str.replace(new RegExp('\u0003', 'g'), '');
    str = str.replace(new RegExp('\u0001', 'g'), '');
    console.log(str);
    return str;
}