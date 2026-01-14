console.log("blog");
console.time("global");

var graphviz_head = `
digraph G {
  edge [headlabel=" ", label=" ", taillabel=" "];
  node [style="rounded", shape=record];
  bgcolor="#FFFFFF";
  ratio=auto;
  compound=true;
`;
var graphviz_foot = `
}
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

function transformAdmonition(admo, txt, results) {
  var arrMatch = null;
  var rePattern = new RegExp("(```"+admo+"\n([^```])*```\n)", "g");
  txt = txt.replace(rePattern, function(match, g1, g2, index){
    code = match.replace("```"+admo+"\n","").replace("```","")
    results.push([marked(match), "<div class='"+admo+"'>"+marked(code)+"</div>"])
    return match;
  })
  return results
}


function mdToHtml(txt){
  admos = transformAdmonition("note", txt, [])
  admos = transformAdmonition("info", txt, admos)
  admos = transformAdmonition("error", txt, admos)
  admos = transformAdmonition("warning", txt, admos)
  txt = marked(txt)
  admos.forEach(elt => {
    txt = txt.replace(elt[0], elt[1])
  })
  return txt;
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
  console.timeEnd('setHeader');
}

function setFooter(fs){
  console.time('setFooter');
  pathFooter = setSpecDiv(fs, 'footer');
  console.timeEnd('setFooter');
}

function setSideBar(fs){
  console.time('setSideBar');
  pathBar = setSpecDiv(fs, 'sidebar', 'personnal-shortcut');
  console.timeEnd('setSideBar')
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
  action = params['action'] ? params['action'] : '',
  search = params['search'] ? params['search'] : '',
  mdfile = params['md'] ? params['md'] : ''; 
  path = mdfile + '.md';
var url = window.location.protocol + '//' + window.location.host+window.location.pathname;
console.log(window.location.host)
var fs = new WebDAV.Fs(url);
var mode = "view";

console.log('globale variable');
console.log('url     :', url);
console.log('path    :', path)
console.log('mdfile  :', mdfile);
console.log('mode    :', mode);
console.log('search  :', search);
console.log('fs      :', fs);

document.body.setAttribute('mode', mode);
document.body.setAttribute('action', action);

setHeader(fs);
setFooter(fs);
setSideBar(fs);
if (action != 'menu' && mdfile.length > 0) {
    loadMd(fs, path);
}

// manage no-style of list with checkbox
hasChild("li", "input[type=checkbox]", "nostyle");

// manage admonition
hasChild("pre", "code.language-error", "error");
hasChild("pre", "code.language-warning", "warning");
hasChild("pre", "code.language-note", "note");

if (mdfile.length == 0){
  var cnt = 0
  if (action != 'search'){
    Array.from(document.querySelectorAll('#original_fancyindex #list a')).reverse().forEach(elt => {
      if ( elt.title.startsWith("_") == false && elt.title.endsWith('.md') == true && cnt < 10) {
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

if (document.querySelectorAll('code.language-graphviz').length > 0) {
  var script = document.createElement("script")
  script.src = '/blog/viz.js'
  script.onload = function(){
    Array.from(document.querySelectorAll('code.language-graphviz')).forEach(elt => {
      var code = elt.innerText;
      if (code.indexOf("digraph") == -1) {
        code = graphviz_head + code + graphviz_foot; 
      }
      img= Viz(code, {'format':'png-image-element'})
      elt.parentNode.appendChild(img);
    });
  }
  document.head.appendChild(script)
}

if (document.querySelectorAll('code.language-mermaid').length > 0) {
  var script = document.createElement("script")
  script.src = '/blog/mermaid.min.js'
  script.onload = function(){
    var i = 0;
    Array.from(document.querySelectorAll('code.language-mermaid')).forEach(elt => {
      var graphDefinition = elt.innerText;
      var insertSvg = function(svgCode, bindFunctions){
        elt.innerHTML = svgCode;
      };
      var graph = mermaid.mermaidAPI.render('graphMermaid'+i, graphDefinition, insertSvg);
      i = i + 1;
    });
  }
  document.head.appendChild(script)
}

console.timeEnd("global");
