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
			vars[key] = value !== undefined ? decodeURIComponent(value) : '';
		}
	);

	if ( param ) {
		return vars[param] ? vars[param] : null;	
	}
	return vars;
}


function readFile(fs, path, is404=""){
  console.time("readFile " + path)
  try {
    var txt=fs.file(path).read();
    if (txt.indexOf("<head><title>404 Not Found</title></head>") == -1) {
      console.timeEnd("readFile " + path);
      return txt;
    } else {
      console.timeEnd("readFile " + path);
      return is404;
    }
  } catch (error) {
      console.timeEnd("readFile " + path);
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
  var t = document.getElementById("content").getElementsByTagName('h1')
  if (t.length > 0) {
    dt = new Date(path.substring(0,4), path.substring(4,6)-1, path.substring(6,8));
    if (!isNaN(dt)) {
      c = document.createElement("span");
      c.classList.add("date");
      c.innerText = dt.toLocaleDateString() ;
      t[0].insertAdjacentElement('afterend', c);
    }
  }
  console.timeEnd('loadMd');
}

function loadMdEditor(fs, path){
  console.time('loadMdEditor');
  document.querySelectorAll("#editor textarea")[0].value = readFile(fs, path, templateBlog);
  console.timeEnd('loadMdEditor');
}

function loadMdExtract(fs, path, id, link, size=300, search=''){
  console.time('loadMdExtract');
  var txtFile = readFile(fs, path);
  if (search.length > 0){
    if (txtFile.indexOf(search) == -1) {
      txtFile = "";
    }
  }
  if (txtFile.length > 0){
    document.getElementById('primary').innerHTML = document.getElementById('primary').innerHTML 
          + "<div id='"+ id +"' class='extract'>"
          + mdToHtml(txtFile.substring(0, size))
          + "<div class='reading'><a href='"+ link +"'>continue reading</a></div>";
          + "</div>"
    var t = document.getElementById(id).getElementsByTagName('h1')
    if (t.length > 0) {
      t[0].innerHTML = "<a href='"+ link +"' class='title'>"+ t[0].innerHTML +"</a></div>";
      dt = new Date(path.substring(0,4), path.substring(4,6)-1, path.substring(6,8));
      if (!isNaN(dt)) {
        c = document.createElement("span");
        c.classList.add("date");
        c.innerText = dt.toLocaleDateString() ;
        t[0].insertAdjacentElement('afterend', c);
      }
    }
    
  }
  console.timeEnd('loadMdExtract');
}

function getSpecPath(fs, namePath){
  find = false;
  fs.rootUrl.split('/').forEach(elt => {
    if (find == false) {
      var htmlPath = readFile(fs, namePath) 
      if (htmlPath.length != 0) {
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
  var t = document.getElementById('header').getElementsByTagName('h1')
  if (t.length > 0) {
    document.title = t[0].innerText;
    t[0].innerHTML = "<a href='"+ url +"' class='title'>"+ t[0].innerHTML +"</a></div>";
  }
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

function setLogIn(urlright, urlwrong, user, password){
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", urlright.replace(/:\/\//, '://'+user+':'+password+'@'), true);
  xmlhttp.onreadystatechange=function() 
  {
    if(xmlhttp.readyState==4){
      if (xmlhttp.status == 200) {
        window.location.href = urlright;
      } else {
        window.location.href = urlwrong;
      }
    }
  }
  xmlhttp.send();
}


function editCancel(){
  if (document.querySelectorAll('#original_fancyindex #list a[title="'+path+'"]').length > 0) {
    if (mdfile.endsWith('_header') == true || mdfile.endsWith('_footer') == true || mdfile.endsWith('_sidebar') == true){
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
  editCancel();
}

function editSaveOnly(){
  editSave();
}


function editUpload(){
  document.getElementById("nameFile").click();
}

function upload(){
  var url = window.location.protocol + '//' + window.location.host+window.location.pathname;
  var fs = new WebDAV.Fs(url);
  var reader = new FileReader();
  reader.onload = function(event) {
    fs.file("./upload/" + document.getElementById("nameFile").files.item(0).name).write(event.target.result);
    alert("Upload terminated");
  };
  reader.readAsArrayBuffer(document.getElementById("nameFile").files[0]);
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
console.log('search  :', search);
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
    var editor = null;
    var styleSheet = document.createElement("link")
    styleSheet.rel = "stylesheet"
    styleSheet.href = '/blog/editor/editor.css'
    document.head.appendChild(styleSheet)
    var script = document.createElement("script")
    script.src = '/blog/editor/editor.js'
    script.onload = function(){
      loadMdEditor(fs, path);
      editor = new Editor({toolbar : [
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
        {name: 'cloud-upload', action: editUpload}
      ]});
      editor.render();
      body = document.body,
      html = document.documentElement;
      // change size of editor for full
      var height = Math.max( body.scrollHeight, body.offsetHeight, 
                          html.clientHeight, html.scrollHeight, html.offsetHeight );
      document.getElementsByClassName("CodeMirror")[0].style.height = (height-110) + 'px';
    }
    document.head.appendChild(script)
  }
}

// manage no-style of list with checkbox
hasChild("li", "input[type=checkbox]", "nostyle");

// manage admonition
hasChild("pre", "code.language-error", "error");
hasChild("pre", "code.language-warning", "warning");
hasChild("pre", "code.language-note", "note");

// manage link
document.getElementById("login-btn").href = urlView + '?' + encodeData({'md':mdfile, 'action':'login'});
document.getElementById("logout-btn").href = urlView + '?' + encodeData({'md':mdfile, 'action':'logout'})
document.getElementById("edit-btn").href = urlEdit + '?' + encodeData({'md':mdfile, 'action':'edit'})

if ( action == 'menu'){
  document.getElementById("menu-btn").href = url + '?' + encodeData({'md':mdfile})
} else {
  document.getElementById("menu-btn").href = url + '?' + encodeData({'md':mdfile, 'action':'menu'})
}


if (mode == "edit" && mdfile == ""){
  document.getElementById("edit-btn").classList.remove("icon-pencil");
  document.getElementById("edit-btn").classList.add("icon-file-text");
  dt = new Date();
  document.getElementById("edit-btn").href = urlEdit + '?' + encodeData({'md':toIsoDate(), 'action':'edit'})
}

// manage action
if (action == 'logout') {
  setLogOut(urlEdit);
}

if (mdfile.length == 0 && action != 'login'){
  var cnt = 0
  if (action != 'edit' && action != 'menu' && action != 'search'){
    Array.from(document.querySelectorAll('#original_fancyindex #list a')).reverse().forEach(elt => {
      if ( elt.title.startsWith("_") == false && elt.title.endsWith('.md') == true && cnt < 5) {
        loadMdExtract(fs, elt.title, elt.title, url + '?' + encodeData({'md': elt.title.substring(0,elt.title.length-3)}));
        cnt = cnt +1;
      }
    })
  }
  if (action == 'search' && search.length > 0) {
    document.getElementById('searchText').value = search;
    if (search.startsWith('year:') == true){
      year = search.substring(5, search.length);
      search = '';
    } else {
      year = ''
    };
    Array.from(document.querySelectorAll('#original_fancyindex #list a')).reverse().forEach(elt => {
      if ( elt.title.startsWith("_") == false && elt.title.endsWith('.md') == true && elt.title.startsWith(year)) {
        loadMdExtract(fs, elt.title, elt.title, url + '?' + encodeData({'md': elt.title.substring(0,elt.title.length-3)}), 300, search);
      }
    })
  }
}

// manage search
var searchText = document.getElementById("searchText");
searchText.addEventListener("keydown", function (e) {
  if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
    if ( document.getElementById('searchText').value.length > 0) {
      window.location.href = url + '?' + encodeData({'action':'search', 'search': document.getElementById('searchText').value });
    } else {
      window.location.href = url;
    }
  };
});

// manage login
if (action == 'login') {
  document.getElementById('userText').focus();
}

var passwordText = document.getElementById("passwordText");
passwordText.addEventListener("keydown", function (e) {
  if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
    if ( document.getElementById('passwordText').value.length > 0 && document.getElementById('userText').value.length > 0) {
      setLogIn(urlEdit + '?' + encodeData({'md': mdfile}), url, document.getElementById('userText').value, document.getElementById('passwordText').value);
    }
  };
});



console.timeEnd("global");