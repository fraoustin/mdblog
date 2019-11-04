console.log("blog");

function params(param) {
	var vars = {};
	window.location.href.replace( location.hash, '' ).replace( 
		/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
		function( m, key, value ) { // callback
			vars[key] = value !== undefined ? value : '';
		}
	);

	if ( param ) {
		return vars[param] ? vars[param] : null;	
	}
	return vars;
}


function readFile(fs, path, is404=""){
  try {
    var txt=fs.file(path).read();
    if (txt.indexOf("<head><title>404 Not Found</title></head>") == -1) {
      return txt;
    } else {
      return is404;
    }
  } catch (error) {
      return "";
  }
}

function writeFile(fs, path, txt){
  fs.file(path).write(txt)
}

function mdToHtml(txt){
    return marked(txt);
}

function loadMd(fs, path){
  document.getElementById('primary').innerHTML = mdToHtml(readFile(fs, path, "Oups ..."));
}

function setHeader(fs){
  var headerPath = '_header.md';
  var find = false;
  fs.rootUrl.split('/').forEach(elt => {
    if (find == false) {
      var htmlHeader = mdToHtml(readFile(fs, headerPath)) 
      if (htmlHeader.length != 0) {
        document.getElementById('header').innerHTML = mdToHtml(readFile(fs, '../_header.md'));
        find = true;
      }
    }
    headerPath = '../' + headerPath;
  });
}

/* load page */
var params = params(),
  mdfile = params['md'] ? params['md'] : ''; 
  path = mdfile + '.md';
var url = window.location.protocol+'//'+window.location.host+window.location.pathname;
var fs = new WebDAV.Fs(url);
var mode = "edit";
if (url.indexOf("/edit/") == -1) {
  mode = "view";
};

console.log('globale variable');
console.log('url    :', url);
console.log('path   :', path)
console.log('mdfile :', mdfile);
console.log('fs     :', fs);
console.log('mode   :', mode);

console.time('setHeader');
setHeader(fs);
console.timeEnd('setHeader');
console.time('loadMd');
loadMd(fs, path);
console.timeEnd('loadMd');