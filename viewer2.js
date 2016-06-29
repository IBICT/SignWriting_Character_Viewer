/**
* SignWriting Character Viewer v2.1
* https://github.com/Slevinski/SignWriting_Character_Viewer
* https://slevinski.github.io/SignWriting_Character_Viewer
* Copyright (c) 2007-2016, Stephen E Slevinski Jr
* SignWriting Character Viewer is released under the MIT License.
*/

//window.onresize = function (){
//  m.redraw();
//}

//translations
var t;
function urlUI(lang){
  if(t && lang==localStorage['langUI']) return;
  var msg = messages[lang];
  if (!msg) {
    lang='en';
    msg = messages[lang];
  }
  localStorage['langUI']=lang;
  t = libTranslate.getTranslationFunction(msg);
}
function tt(args){
  text = t.apply(this,arguments);
  text = text.replace(/@@/g,'');
  return m.trust(sw10.svg(text) || '<p>' + text + '</p>');
}

window.onhashchange = hashChange;

var urlSet,urlSym;
function hashSet(){
  var hash = '?ui=' + localStorage['langUI'];
  if (urlSet) hash+= '&set=' + urlSet;
  if (urlSym) hash+= '&sym=' + urlSym;
  window.location.hash = hash
}
function hashChange(event){
  var vars={};
  var hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for(var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    vars[hash[0]] = hash[1];
  }
  var newUI = vars['ui']?vars['ui']:localStorage['langUI']?localStorage['langUI']:'en';
  var newSet = vars['set']?vars['set']:'key';
  var newSym = vars['sym']?vars['sym']:'';
  if (newUI==localStorage['langUI'] && newSet==urlSet && newSym==urlSym) return;
  urlUI(newUI);
  urlSet = newSet;
  urlSym = newSym;
  hashSet();
  m.redraw();
}

// HEADER
//////////
var header = {};
header.controller = function(){};
header.view = function(ctrl){
  return [ m('div',{onclick:function(e){urlSym='';hashSet();}},tt("sw_viewer_2")),
    m("div.topleft",m("a[href='index.html']", t("index"))),
    m("div.topright",m("a.topright[href='SignWriting_Character_Viewer.html']", "v1")),
    m('div.section',[
      m('div.btn',{class:urlSet=='key'?'selected':'',onclick:function(e){urlSet='key';urlSym='';hashSet();}},tt('Symbols Keys')),
      m('div.btn',{class:urlSet=='uni10'?'selected':'',onclick:function(e){urlSet='uni10';urlSym='';hashSet();}},tt('Plane 4'))
      ])
  ];
};

// TABLE
////////
var table = {};
table.controller = function (){};
table.view = function(ctrl){
  var spaces = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
  var data=[],row=[],fills=[],rots=[];
  var rowCode,rowTitle,baseKey,catKey,groupKey,key,uni,code,fill,rot,tooltip,cellSym,svg;
  var nav,first,prev,next,last;
  if (urlSym){
    switch (urlSet){
      case "key":
        baseKey = urlSym;
        first = 'S100';
        last = 'S38b';
        prev = baseKey==first?first:'S'+(parseInt(baseKey.slice(1,4),16)-1).toString(16);
        next = baseKey==last?last:'S'+(parseInt(baseKey.slice(1,4),16)+1).toString(16);
        break;
      case "uni10":
        code = parseInt(urlSym.slice(1,6),16)-1;
        baseKey = "S" + parseInt(code/96+256).toString(16);
        uni = urlSym;
        first = '40001';
        last = '4F421';
        prev = uni==first?first:(parseInt(uni,16)-96).toString(16).toUpperCase();
        next = uni==last?last:(parseInt(uni,16)+96).toString(16).toUpperCase();
        break;
      default:
        return;
    }
    var cat = sw10.structure('category');
    var catKey = sw10.structure('category',baseKey);
    var group = sw10.structure('group');
    var groupKey = sw10.structure('group',baseKey);
    
    nav=[
    m("table",{class:"structure"},m('tr',cat.map(function(cell){
      attr = {title:t('cat_' + cell),onclick:function(e){urlSym=urlSet=='key'?cell:sw10.uni10(cell+'00',true);hashSet();}};
      return m(cell==catKey?'th':'td',attr,'');
    }))),
    m("table",{class:"structure"},m('tr',group.map(function(cell){
      attr = {title:t('group_' + cell),onclick:function(e){urlSym=urlSet=='key'?cell:((sw10.uni10(cell+'00',true)));hashSet();}};
      return m(cell==groupKey?'th':'td',attr,'');
    }))),
      m('div.title',(urlSet=='uni10')?tt("uni_" + baseKey):tt("base_" + baseKey)),
      m('div.nav',
        m('div.btn',{onclick:function(e){urlSym=first;hashSet();}},m.trust(tt('firstPage'))),
        m('div.btn',{onclick:function(e){urlSym=prev;hashSet();}},m.trust(tt('prevPage'))),
        m('div.btn',{onclick:function(e){urlSym=next;hashSet();}},m.trust(tt('nextPage'))),
        m('div.btn',{onclick:function(e){urlSym=last;hashSet();}},m.trust(tt('lastPage')))
      )
    ];

    row=[];
    row.push(['th.prime',urlSet=='key'?baseKey:urlSet=='code'?'':'U+' + uni]);
    for(var c = 0; c < 6; c++) {
      fills[c]= (urlSet=='key')?c.toString(16):'';
      row.push(['th',fills[c]?fills[c]:"+" + (c*16).toString(16),'','']);
    }
    data.push(row);

    for(var r = 0; r < 16; r++) {
      rots[r]= (urlSet=='key')?r.toString(16):'';
    }
  
    for(var r = 0; r < 16; r++) {
      row = [];
      row.push(['th', rots[r]?rots[r]:"+" + r.toString(16).toUpperCase(),'','']);
      for(var c = 0; c < 6; c++) {
        key = baseKey + c.toString(16) + r.toString(16);
        //except for FireFox, view:'key" is slow...
        svg = sw10.svg(key,{view:'code',copy:urlSet});
        if (svg){
          tooltip = urlSet=='key'?key:'U+'+(parseInt(uni,16) + c*16+r).toString(16).toUpperCase();
          row.push(['td',svg,tooltip,'']);
        } else {
          row.push(['td.invalid','','','']);
        }
      }
      data.push(row);
    }
  } else {
    var cat = sw10.structure('category');
    var group = sw10.structure('group');
    nav=[
    m("table",{class:"structure"},m('tr',cat.map(function(cell){
      attr = {title:t('cat_' + cell),onclick:function(e){urlSym=urlSet=='key'?cell:((sw10.code(cell+'00',true)));hashSet();}};
      return m('td',attr,'');
    }))),
    m("table",{class:"structure"},m('tr',group.map(function(cell){
      attr = {title:t('group_' + cell),onclick:function(e){urlSym=urlSet=='key'?cell:((sw10.uni10(cell+'00',true)));hashSet();}};
      return m('td',attr,'');
    })))
    ];
    row.push(['th',spaces]);
    for(var c = 0; c < 16; c++) {
      row.push(['th',urlSet=='key'?c.toString(16):spaces]);
    }
    data.push(row);
  
    for(var r = 0; r < 41; r++) {
      row = [];
      rowCode = 256+(r*16);
      uni = urlSet=='uni10'?'4D' + (r+16+112).toString(16).toUpperCase():'FD' + (r+16+115).toString(16).toUpperCase();
      key =  'S' + rowCode.toString(16).slice(0,2);
      rowTitle = urlSet=='key'?key+'x':spaces
      row.push(['th', rowTitle,'','']);
      for(var c = 0; c < 16; c++) {
        baseKey = "S" + (rowCode+c).toString(16);
        key = sw10.view(baseKey,urlSet=='uni10');
        //except for FireFox, view:'key" is slow...
        svg = sw10.svg(key,{view:'code',copy:urlSet});
        if (svg){
          cellSym = urlSet=='key'?baseKey:sw10.uni10(baseKey+'00',true);
          tooltip = urlSet!='key'?'U+':'';
          tooltip += cellSym + ': ';
          tooltip += (urlSet=='uni10')?t("uni_" + baseKey):t("base_" + baseKey);
          row.push(['td',svg,tooltip,cellSym]);
        } else {
          row.push(['td.invalid','','','']);
        }
      }
      data.push(row);
    }
  }
  var attr; 
  return [nav,
    m("table",{class:(urlSym)?"sub":"main"},data.map(function(row){
      return m("tr",row.map(function(cell){
        attr = {title:cell[2],onclick:function(e){if(cell[3]){urlSym=cell[3];hashSet();}}};
        for (var attrname in cell[4]) { attr[attrname] = cell[4][attrname]; }
        return m(cell[0],attr,m.trust(cell[1]));
      }));
    }))
  ];
};

//Init App
hashChange();
m.mount(document.getElementById("header"), header);
m.mount(document.getElementById("table"), table);
var cssCheck;
window.onload = function () {
  var cnt = 0;
  if (!sw10.size("S10000")){
    cssCheck = setInterval(function(){
      if (sw10.size("S10000")){
        clearInterval(cssCheck);
        m.redraw();1
      }
    },100);
  }
}
