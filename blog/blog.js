console.log("blog");
console.time("global");
var templateBlog = `# Title

![tag](Name Of Tag)
![category](Name Of Category)

Your text
`;

function isDate(value) {
  return (value && typeof value == 'object' && toString.call(value) == '[object Date]') || false;
};

function toIsoDate(dt) {
  if (!isDate(dt)) dt = new Date();
  var zeropad = function(num, len) { 
    var output = num.toString();
    while (output.length < len) output = '0' + output;
    return output;
  }
  return dt.getFullYear() + zeropad(dt.getMonth() + 1, 2) + zeropad(dt.getDate(), 2)+ zeropad(dt.getHours(), 2)+ zeropad(dt.getMinutes(), 2)+ zeropad(dt.getSeconds(), 2);
};

// Set options
// `highlight` example uses `highlight.js`
marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: function(code) {
    return hljs.highlightAuto(code).value;
  }
});

function encodeData(data) {
  return Object.keys(data).map(function(key) {
      return [key, data[key]].map(encodeURIComponent).join("=");
  }).join("&");
}

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
  console.time("readFile")
  try {
    var txt=fs.file(path).read();
    if (txt.indexOf("<head><title>404 Not Found</title></head>") == -1) {
      console.timeEnd("readFile");
      return txt;
    } else {
      console.timeEnd("readFile");
      return is404;
    }
  } catch (error) {
      console.timeEnd("readFile");
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
  console.time('loadMd');
  document.getElementById('primary').innerHTML = mdToHtml(readFile(fs, path, "Oups ..."));
  console.timeEnd('loadMd');
}

function loadMdEditor(fs, path){
  console.time('loadMdEditor');
  document.querySelectorAll("#editor textarea")[0].value = readFile(fs, path, templateBlog);
  console.timeEnd('loadMdEditor');
}

function loadMdExtract(fs, path, id, link, size=300){
  console.time('loadMdExtract');
  document.getElementById('primary').innerHTML = document.getElementById('primary').innerHTML 
        + "<div id='"+ id +"' class='extract'>"
        + mdToHtml(readFile(fs, path).substring(0, size))
        + "<div class='reading'><a href='"+ link +"'>continue reading</a></div>";
        + "</div>"
  var t = document.getElementById(id).getElementsByTagName('h1')
  if (t.length > 0) {
    t[0].innerHTML = "<a href='"+ link +"' class='title'>"+ t[0].innerHTML +"</a></div>";
  }
  console.timeEnd('loadMdExtract');
}

function getSpecPath(fs, namePath){
  find = false;
  fs.rootUrl.split('/').forEach(elt => {
    if (find == false) {
      var htmlHeader = readFile(fs, namePath) 
      if (htmlHeader.length != 0) {
        find = true;
      }else{
        namePath = '../' + namePath;
      }
    }
  });
  if (find) {
    return namePath
  }
  return '' 
}

function setSpecDiv(fs, name, id=''){
  if (id.length == 0) {
    id = name
  }
  var namePath = '_' + name + '.md';
  namePath = getSpecPath(fs, namePath);
  if (namePath.length > 0) {
    document.getElementById(id).innerHTML = mdToHtml(readFile(fs, namePath));
    return namePath  
  }
  return '';
}

function setHeader(fs){
  console.time('setHeader');
  pathHeader = setSpecDiv(fs, 'header');
  if (pathHeader.length == 0) {
    pathHeader = '_header'
  } else {
    pathHeader = pathHeader.substring(0,pathHeader.length-3);
  }
  document.getElementById('header.md').href = urlEdit + '?' + encodeData({'md':pathHeader, 'action':'edit'});
  console.timeEnd('setHeader');
}

function setFooter(fs){
  console.time('setFooter');
  pathFooter = setSpecDiv(fs, 'footer');
  if (pathFooter.length == 0) {
    pathFooter = '_footer'
  } else {
    pathFooter = pathFooter.substring(0,pathFooter.length-3);
  }
  document.getElementById('footer.md').href = urlEdit + '?' + encodeData({'md':pathFooter, 'action':'edit'});
  console.timeEnd('setFooter');
}

function setSideBar(fs){
  console.time('setSideBar');
  pathBar = setSpecDiv(fs, 'sidebar', 'personnal-shortcut');
  if (pathBar.length == 0) {
    pathBar = '_sidebar'
  } else {
    pathBar = pathBar.substring(0,pathBar.length-3);
  }
  document.getElementById('sidebar.md').href = urlEdit + '?' + encodeData({'md':pathBar, 'action':'edit'});
  console.timeEnd('setSideBar')
}


function hasChild(parent, child, add){
  document.querySelectorAll(parent).forEach(elt => {
    if (elt.querySelectorAll(child).length > 0){
      elt.classList.add(add)
    }
  })
}

function getUrlEdit(mode, url){
  if (mode == "view") {
    //todo
    return  window.location.protocol + '//' + window.location.host + '/edit' +  window.location.pathname; 
  } else {
    return url;
  }
}

function getUrlView(mode, url){
  if (mode == 'view') {
    return url;
  } else {
    //todo
    return url.replace('/edit/', '/'); 
  }
}

function setLogOut(url){
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", url.replace(/:\/\//, '://log:out@'), true);
  xmlhttp.send();
}

function editCancel(){
  if (document.querySelectorAll('#original_fancyindex #list a[title="'+path+'"]').length > 0) {
    if (mdfile == '_header' || mdfile == '_footer' || mdfile == '__sidebar'){
      mdfile = ''
    }
    window.location.href = urlEdit + '?' + encodeData({'md':mdfile});
  } else {
    window.location.href = urlEdit;
  }
}

function editSave(){
  console.time("editSave");
  writeFile(fs, path, editor.codemirror.getValue());
  console.timeEnd("editSave");
}

function editSaveAndClose(){
  editSave();
  if (mdfile == '_header' || mdfile == '_footer' || mdfile == '__sidebar'){
    mdfile = ''
  }
  window.location.href = urlEdit + '?' + encodeData({'md':mdfile});
}

function editSaveOnly(){
  editSave();
}

/* load page */
var params = params(),
  action = params['action'] ? params['action'] : '',
  search = params['search'] ? params['search'] : '',
  mdfile = params['md'] ? params['md'] : ''; 
  path = mdfile + '.md';
var url = window.location.protocol + '//' + window.location.host+window.location.pathname;
console.log(window.location.host)
var fs = new WebDAV.Fs(url);
var mode = "edit";
if (url.indexOf("/edit/") == -1) {
  mode = "view";
};
var urlView = getUrlView(mode, url);
var urlEdit = getUrlEdit(mode, url);


console.log('globale variable');
console.log('url     :', url);
console.log('urlView :', urlView);
console.log('urlEdit :', urlEdit);
console.log('path    :', path)
console.log('mdfile  :', mdfile);
console.log('mode    :', mode);
console.log('fs      :', fs);

document.body.setAttribute('mode', mode);
document.body.setAttribute('action', action);

if (mode == 'edit' || mode == 'view') {
  setHeader(fs);
  setFooter(fs);
  if (action != 'edit') {
    setSideBar(fs);
    if (action != 'menu' && mdfile.length > 0) {
      loadMd(fs, path);
    }
  } else {
    loadMdEditor(fs, path);
    var editor = new Editor({toolbar : [
      {name: 'cross', action: editCancel},
      {name: 'floppy-disk', action: editSaveAndClose},
      {name: 'download', action: editSaveOnly},
      '|',
      {name: 'space', action: null},
      '|',
      {name: 'bold', action: Editor.toggleBold},
      {name: 'italic', action: Editor.toggleItalic},
      {name: 'code', action: Editor.toggleCodeBlock},
      '|',
      {name: 'quote', action: Editor.toggleBlockquote},
      {name: 'unordered-list', action: Editor.toggleUnOrderedList},
      {name: 'ordered-list', action: Editor.toggleOrderedList},
      '|',
      {name: 'link', action: Editor.drawLink},
      {name: 'image', action: Editor.drawImage},
    ]});
    editor.render();
    body = document.body,
    html = document.documentElement;
    // change size of editor for full
    var height = Math.max( body.scrollHeight, body.offsetHeight, 
                       html.clientHeight, html.scrollHeight, html.offsetHeight );
    document.getElementsByClassName("CodeMirror")[0].style.height = (height-110) + 'px';
  }
}

// manage no-style of list with checkbox
hasChild("li", "input[type=checkbox]", "nostyle");

// manage admonition
hasChild("pre", "code.language-error", "error");
hasChild("pre", "code.language-warning", "warning");
hasChild("pre", "code.language-note", "note");

// manage link
document.getElementById("login-btn").href = urlEdit + '?' + encodeData({'md':mdfile});
document.getElementById("logout-btn").href = urlView + '?' + encodeData({'md':mdfile, 'action':'logout'})
document.getElementById("edit-btn").href = urlEdit + '?' + encodeData({'md':mdfile, 'action':'edit'})

if ( action == 'menu'){
  document.getElementById("menu-btn").href = url + '?' + encodeData({'md':mdfile})
} else {
  document.getElementById("menu-btn").href = url + '?' + encodeData({'md':mdfile, 'action':'menu'})
}


if (mode == "edit" && mdfile == ""){
  document.getElementById("edit-btn").innerText = "New";
  dt = new Date();
  document.getElementById("edit-btn").href = urlEdit + '?' + encodeData({'md':toIsoDate(), 'action':'edit'})
}

// manage action
if (action == 'logout') {
  setLogOut(urlEdit);
}

if (mdfile.length == 0){
  var cnt = 0
  if (action != 'edit' && action != 'menu'){
    Array.from(document.querySelectorAll('#original_fancyindex #list a')).reverse().forEach(elt => {
      if ( elt.title.startsWith("_") == false && elt.title.endsWith('.md') == true && cnt < 10) {
        console.log(elt.title);
        loadMdExtract(fs, elt.title, elt.title, url + '?' + encodeData({'md': elt.title.substring(0,elt.title.length-3)}));
        cnt = cnt +1;
      }
    })
  }
}

console.timeEnd("global");