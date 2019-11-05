console.log("blog");



// Set options
// `highlight` example uses `highlight.js`
marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: function(code) {
    return hljs.highlightAuto(code).value;
  },
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
});




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

function setSpecDiv(fs, name){
  var namePath = '_' + name + '.md';
  var find = false;
  fs.rootUrl.split('/').forEach(elt => {
    if (find == false) {
      var htmlHeader = mdToHtml(readFile(fs, namePath)) 
      if (htmlHeader.length != 0) {
        document.getElementById(name).innerHTML = mdToHtml(readFile(fs, namePath));
        find = true;
      }
    }
    namePath = '../' + namePath;
  });
}

function setHeader(fs){
  setSpecDiv(fs, 'header');
}

function setFooter(fs){
  setSpecDiv(fs, 'footer');
}

function hasChild(parent, child, add){
  document.querySelectorAll(parent).forEach(elt => {
    if (elt.querySelectorAll(child).length > 0){
      elt.classList.add(add)
    }
  })
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
var urlView = url;
var urlEdit = url;


console.log('globale variable');
console.log('url     :', url);
console.log('urlView :', urlView);
console.log('urlEdit :', urlEdit);
console.log('path    :', path)
console.log('mdfile  :', mdfile);
console.log('mode    :', mode);
console.log('fs      :', fs);

console.time('setHeader');
setHeader(fs);
console.timeEnd('setHeader');
console.time('setFooter');
setFooter(fs);
console.timeEnd('setFooter');
console.time('loadMd');
loadMd(fs, path);
console.timeEnd('loadMd');

// manage no-style of list with checkbox
hasChild("li", "input[type=checkbox]", "nostyle");
// manage admonition
hasChild("pre", "code.language-error", "error");
hasChild("pre", "code.language-warning", "warning");
hasChild("pre", "code.language-note", "note");
