/*
 source : nehan.js
 version : 1.1.8
 site : http://tategakibunko.mydns.jp/
 blog : http://tategakibunko.blog83.fc2.com/

 Copyright (c) 2010, Watanabe Masaki <lambda.watanabe[at]gmail.com>
 licenced under MIT licence.

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
*/
var Nehan;

if(!Nehan){
  Nehan = {};
}

if(!Nehan.Layout){
  Nehan.Layout = {};
}

if(!Nehan.TextStream){
  Nehan.TextStream = {};
}

if(!Nehan.StreamParser){
  Nehan.StreamParser = {};
}

if(!Nehan.LayoutMapper){
  Nehan.LayoutMapper = {};
}

if(!Nehan.Env){
  Nehan.Env = {};
}

if(!Nehan.ParserHook){
  Nehan.ParserHook = {};
}

(function(){

  var Filename = {
    concat : function(p1, p2){
      p1 = (p1=="")? "" : (p1.slice(-1) == "/")? p1 : p1 + "/";
      p2 = (p2=="")? "" : (p2[0] == "/")? p2.substring(1, p2.length) : p2;
      return p1 + p2;
    }
  };

  var Option = {
    read : function(dst, defopt, opt){
      for(prop in defopt){
	dst[prop] = (typeof opt[prop] == "undefined")? defopt[prop] : opt[prop];
      }
    }
  };

  // http://www.quirksmode.org/js/detect.html
  var BrowserDetect = {
    init: function () {
      this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
      this.version = this.searchVersion(navigator.userAgent)
	|| this.searchVersion(navigator.appVersion)
	|| "an unknown version";
      this.OS = this.searchString(this.dataOS) || "an unknown OS";
    },
    searchString: function (data) {
      for (var i=0;i<data.length;i++){
	var dataString = data[i].string;
	var dataProp = data[i].prop;
	this.versionSearchString = data[i].versionSearch || data[i].identity;
	if (dataString) {
	  if (dataString.indexOf(data[i].subString) != -1)
	    return data[i].identity;
	}
	else if (dataProp)
	  return data[i].identity;
      }
    },
    searchVersion: function (dataString) {
      var index = dataString.indexOf(this.versionSearchString);
      if (index == -1) return;
	return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
    },
    dataBrowser: [
		  {
		    string: navigator.userAgent,
		    subString: "Chrome",
		    identity: "Chrome"
		  },
		  { string: navigator.userAgent,
		    subString: "OmniWeb",
		    versionSearch: "OmniWeb/",
		    identity: "OmniWeb"
		  },
		  {
		    string: navigator.vendor,
		    subString: "Apple",
		    identity: "Safari",
		    versionSearch: "Version"
		  },
		  {
		    prop: window.opera,
		    identity: "Opera"
		  },
		  {
		    string: navigator.vendor,
		    subString: "iCab",
		    identity: "iCab"
		  },
		  {
		    string: navigator.vendor,
		    subString: "KDE",
		    identity: "Konqueror"
		  },
		  {
		    string: navigator.userAgent,
		    subString: "Firefox",
		    identity: "Firefox"
		  },
		  {
		    string: navigator.vendor,
		    subString: "Camino",
		    identity: "Camino"
		  },
		  {// for newer Netscapes (6+)
		    string: navigator.userAgent,
		    subString: "Netscape",
		    identity: "Netscape"
		  },
		  {
		    string: navigator.userAgent,
		    subString: "MSIE",
		    identity: "Explorer",
		    versionSearch: "MSIE"
		  },
		  {
		    string: navigator.userAgent,
		    subString: "Gecko",
		    identity: "Mozilla",
		    versionSearch: "rv"
		  },
		  { // for older Netscapes (4-)
		    string: navigator.userAgent,
		    subString: "Mozilla",
		    identity: "Netscape",
		    versionSearch: "Mozilla"
		  }
		  ],
    dataOS : [
	      {
		string: navigator.platform,
		subString: "Win",
		identity: "Windows"
	      },
	      {
		string: navigator.platform,
		subString: "Mac",
		identity: "Mac"
	      },
	      {
		string: navigator.userAgent,
		subString: "iPhone",
		identity: "iPhone/iPod"
	      },
	      {
		string: navigator.platform,
		subString: "Linux",
		identity: "Linux"
	      }
	      ]

  };

  BrowserDetect.init();

  // public interface of environment variables.
  var Env = {
    init : function(){
      var browser = BrowserDetect.browser.toLowerCase();
      var version = BrowserDetect.version;
      var os = BrowserDetect.OS;

      this.isIE = (browser == "explorer");
      this.isWin = (os == "Windows");
      this.isMac = (os == "Mac");
      this.isVistaOrWin7 = (navigator.userAgent.toLowerCase().indexOf("windows nt 6") >= 0);

      // check if browser can support transform method
      if (browser == "chrome"){
	this.canTransform = true;
      } else if (browser == "safari"){
	this.canTransform = true;
      } else if (browser == "firefox" && version >= 3.5){
	this.canTransform = true;
      } else if (this.isIE && version >= 6.0){
	this.canTransform = true;
      } else {
	this.canTransform = false;
      }
    }
  };

  Env.init();

  var inlineAttr = function(attr){
    var ret = "";
    for(prop in attr){
      if(attr[prop] != ""){
	ret += prop + "='" + attr[prop] + "' ";
      }
    }
    return ret;
  };

  var inlineCss = function(attr){
    var ret = "";
    for(prop in attr){
      ret += prop + ":" + attr[prop] + ";";
    }
    return ret;
  };

  var tagStart = function(tag, attr, isSingle){
    return "<" + tag + " " + inlineAttr(attr) + (isSingle? " />" : " >");
  };

  function Layout(option){
    Option.read(this, {
      width : 700,
      height: 480,
      fontSize : 16,
      lineHeightRate: 1.8,
      letterSpacingRate: 0.1,
      direction : "vertical",
      textLayerClassName : "text-layer",
      charImgRoot: "/img/char",
      charImgMap:[],
      charImgColor:"black",
      kinsokuCharCount:2,
      headNgChars:[ "？", "】", "，", ",", "》", "。",
		   "、", "・", "｣", "」", "』","）", "＞", "〉",
		   "≫","]", "〕", "]","］","！","!",") ",
		   "々", "ゝ", "ー", "－" ],
      tailNgChars:[ "【", "《", "「", "『", "（",
		   "［" , "[" , "〔" ,
		   "＜", "≪", "(", "〈" ],
      plusCss:{}
    }, option);
    
    if (typeof option.fontFamily != "undefined"){
      this.fontFamily = option.fontFamily;
    }
    this.initialize();
  };

  Layout.prototype.initialize = function(){
    this.direction = this.direction.toLowerCase();
    this.directionH = (this.direction == "horizontal" || this.direction == "vertical-lr")? "lr" : "rl";
    this.isV = (this.direction == "vertical" || this.direction == "vertical-lr" || this.direction == "vertical-rl");
    this.baseLineHeight = Math.floor(this.lineHeightRate * this.fontSize);
    this.baseLetterSpacing = Math.floor(this.letterSpacingRate * this.fontSize);
    var minW = this.baseLineHeight;
    var minH = this.fontSize + this.baseLetterSpacing;
    this.width = Math.max(minW, this.width);
    this.height = Math.max(minH, this.height);
    this.yohakuHeight = this.baseLineHeight - this.fontSize;
    this.letterHeight = (this.isV)? this.fontSize + this.baseLetterSpacing : 1;
    this.wrapTag = (this.isV)? "table" : "div";
    this.rubyFontSize = Math.floor(this.fontSize / 2); // half size of main text font size.

    if (this.isV){
      this.lineCount = Math.floor(this.height / this.letterHeight) - this.kinsokuCharCount;
    } else {
      this.lineCount = Math.floor(this.width / this.fontSize) - this.kinsokuCharCount;
    }

    this.wrapCss = "";
    this.wrapCss += "text-align:left;";
    this.wrapCss += "padding:0;";
    this.wrapCss += "font-size:" + this.fontSize + "px;";
    this.wrapCss += "width:" + this.width + "px;";
    this.wrapCss += "height:" + this.height + "px;";
    this.wrapCss += "overflow:hidden;";
    this.wrapCss += "white-space:nowrap;"; // when tail NG happend, disable auto newline even if over flow layout size.
    
    if(this.isV){
      this.wrapCss += "border-collapse:collapse;";
    } else {
      this.wrapCss += "line-height:1.8em;";
      this.wrapCss += "letter-spacing:0;";
    }
    if (typeof this.fontFamily == "undefined"){
      this.wrapCss += "font-family:monospace;";
    } else if (this.fontFamily == ""){
      this.wrapCss += "font-family:monospace;";
    } else {
      this.wrapCss += "font-family:" + this.fontFamily + ", monospace;";
    }
    this.wrapCss += inlineCss(this.plusCss);
  };

  Layout.prototype.setHeight = function(height){
    this.height = height;
  };

  Layout.prototype.setWidth = function(width){
    this.width = width;
  };

  Layout.prototype.setCharImgRoot = function(root){
    this.charImgRoot = root;
  };

  Layout.prototype.setCharImgColor = function(color){
    var c = color.toLowerCase().replace(/#/g,"");
    if(c == "white" || c == "fff" || c == "ffffff"){
      this.charImgColor = "white";
    } else {
      this.charImgColor = "black";
    }
  };

  Layout.prototype.setDirection = function(direction){
    this.direction = direction;
  };

  Layout.prototype.getDirection = function(){
    return this.direction;
  };

  Layout.prototype.setFontFamily = function(family){
    this.fontFamily = family;
  };

  Layout.prototype.setFontSize = function(size){
    this.fontSize = size;
  };

  Layout.prototype.setLineHeightRate = function(rate){
    this.lineHeightRate = rate;
  };

  Layout.prototype.setLetterSpacingRate = function(rate){
    this.letterSpacingRate = rate;
  };

  Layout.prototype.setKinsokuCharCount = function(count){
    this.kinsokuCharCount = count;
  };

  function TextStream(buffer, length, isEOF){
    this.buffer = buffer;
    this.length = length;
    this.isEOF = isEOF;
    this.seekPos = 0;
  };

  TextStream.prototype.getchar = function(){
    if (this.seekPos < this.buffer.length){
      var s = this.buffer.substring(this.seekPos,this.seekPos+1);
      this.seekPos++;
      return s;
    } else {
      throw "BufferEnd";
    }
  };

  TextStream.prototype.lookNextChar = function(){
    if (this.seekPos < this.buffer.length){
      return this.buffer.substring(this.seekPos,this.seekPos+1);
    }
    return "";
  };

  TextStream.prototype.stepSeekPos = function(){
    if (this.seekPos < this.buffer.length){
      this.seekPos++;
    }
  };

  TextStream.prototype.getTag = function(){
    var ret = "<";
    while(true){
      var s = this.getchar();
      ret += s;
      if (s == ">"){
	return ret;
      }
    }
  };

  TextStream.prototype.skipCRLF = function(){
    var mark = this.seekPos;
    var nc1 = this.lookNextChar();
    if(nc1 == "\n"){
      this.seekPos++;
      return this.seekPos;
    } else if (nc1 == "\r"){
      this.seekPos++;
      var nc2 = this.lookNextChar();
      if (nc2 == "\n"){
	this.seekPos++;
	return this.seekPos;
      }
    }
    return mark;
  };

  TextStream.prototype.getBuffer = function(){
    return this.buffer;
  };

  TextStream.prototype.setBuffer = function(buff, length){
    this.buffer = buff;
    this.length = (typeof length != "undefined")? length : buff.length;
    this.isEOF = true;
  };

  TextStream.prototype.addBuffer = function(buff){
    if(!this.isEOF){
      this.buffer += buff;
      if(this.buffer.length >= this.length){
	this.isEOF = true;
      }
    }
  };

  TextStream.prototype.setEOF = function(isEOF){
    this.isEOF = isEOF;
  };

  TextStream.prototype.getEOF = function(){
    return this.isEOF;
  };

  function RubyStream(rubyStartPos){
    this.kanji = "";
    this.yomi = "";
    this.seekPos = 0;
    this.rubyStartPos = rubyStartPos;
    this.ready = false;
  };

  RubyStream.prototype.addKanji = function(s1){
    this.kanji += s1;
  };

  RubyStream.prototype.addYomi = function(s1){
    this.yomi += s1;
  };

  RubyStream.prototype.setReady = function(){
    this.ready = true;
  };

  RubyStream.prototype.isReady = function(){
    return this.ready;
  };

  RubyStream.prototype.getchar = function(){
    if(this.seekPos < this.kanji.length){
      var s = this.kanji.substring(this.seekPos, this.seekPos+1);
      this.seekPos++;
      return s;
    } else {
      throw "RubyBufferEnd";
    }
  };

  var ParserHook = {
    tagHook : {},
    enableTagHook : function(tagName){
      return (typeof this.tagHook[tagName] != "undefined");
    },
    addTagHook : function(tagName, action){
      this.tagHook[tagName] = action;
    },
    getTagHook : function(tagName){
      return this.tagHook[tagName];
    }
  };

  function StreamParser(layout, textStream){
    this.layout = layout;
    this.seekCharCount = 0; // real charactor count except ruby, tag, newline(\n)
    this.seekTable = [{spos:0, cpos:0}];
    this.seekWidth = 0;
    this.seekHeight = 0;
    this.seekLineCharCount = 0;
    this.lineBuff = "";
    this.lineSave = ""; // stock value of lineBuff before parsing tag.
    this.resumePos = -1; // stock value of textStream.seekPos before parsing tag.
    this.blockBuff = "";
    this.tagStack = [];
    this.rubyStack = [];
    this.pageCache = [];
    this.boutenStack = [];
    this.boutenCount = 0;
    this.bouten = false;
    this.indentCount = 0;
    this.rubyStream = null;
    this.packStr = "";
    this.textStream = textStream;
    this.isResuming = false;
    this.cacheAble = true;
    this.fontScale = 1;
    this.lineScale = 1;
    this.bgColor = "";
    this.fontStyle = ""; // for IE or horizontal
    this.isImgChar = false;
    this.isHankaku = false;
    this.imgBuff = [];
    this.curImgWidth = 0;
    this.imgIndentCount = 0;
    this.blockIndentCount = 0;
    this.halfWordBreak = false;
    this.anchors = {};
    this.anchorCount = 0;
    this.anchorName = "";
  };

  StreamParser.prototype.activateTag = function(tag, enable){
    var watchFlags = ["ruby", "rp", "rb", "rt", "pack", "script", "object"];
    for(var i = 0; i < watchFlags.length; i++){
      if(tag == watchFlags[i]){
	this[tag] = enable;
	return;
      }
    }
  };

  StreamParser.prototype.isActiveTag = function(tag){
    if(typeof this[tag] == "undefined"){
      return false;
    }
    return this[tag];
  };

  StreamParser.prototype.getTextStream = function(){
    return this.textStream;
  };

  StreamParser.prototype.charToImg = function(c){
    switch(c){
      case "「": case "｢": c = "kakko1.gif"; break;
      case "」": case "｣" : c = "kakko2.gif"; break;
      case "『": c = "kakko3.gif"; break;
      case "』": c = "kakko4.gif"; break;
      case "（": case "(": case "{": c = "kakko5.gif"; break;
      case "）": case "}": case ")": c = "kakko6.gif"; break;
      case "＜" : case "<"  : case "〈" : c = "kakko7.gif"; break;
      case "＞" : case ">"  : case "〉" : c = "kakko8.gif"; break;
      case "《" : case "≪" : c = "kakko9.gif"; break;
      case "》" : case "≫" : c = "kakko10.gif"; break;
      case "［" : case "["  : case "〔" : c = "kakko13.gif"; break;
      case "］" : case "]"  : case "〕" : c = "kakko14.gif"; break;
      case "【" : c = "kakko17.gif"; break;
      case "】" : c = "kakko18.gif"; break;
      case "｡":  case "。" : c = "kuten.gif"; break;
      case "．" :  case "."  : c = "kuten2.gif"; break;
      case "､": case "、" : case ","  : case  "，" : c = "touten.gif"; break;
      case  "～" : case  "〜" : c = "kara.gif"; break;
      case "…" : c = "mmm.gif"; break;
      case "：" : case ":" : c = "tenten.gif"; break;
      case "‥" : c = "mm.gif"; break;
      case "＝" : case "=" : c = "equal.gif"; break;
      case "―" : c = "dash.gif"; break;
      case "〝" : c = "dmn1.gif"; break;
      case "〟": c = "dmn2.gif"; break;
      case "ー" : case "－" : case "━" : c = "｜"; break;
      case "—": case "-"  : case "‐" : case "─" : case "−": case "_": case "ｰ": c = "｜"; break;
      case "→": case "⇒": c = "↓"; break;
      case "←": c = "↑"; break;
      case "!": c = "！"; break;
      case "?": c = "？"; break;
      case "･": c = "・"; break;
      case "+": c = "＋"; break;
      case "@": c = "＠"; break;
      case "#": c = "＃"; break;
      case "\\": c = "￥"; break;
      default: break;
    }
    return c;
  };

  StreamParser.prototype.makeCharInner = function(c1){
    var c2 = this.charToImg(c1);

    if(c2.match(/\.gif/)){
      this.isImgChar = true;
      var imgKey = (this.layout.charImgColor=="white")? "w@" + c2 : c2;
      if(typeof this.layout.charImgMap[imgKey] != "undefined"){
	return this.makeCharImgTag(this.layout.charImgMap[imgKey]);
      }
    }
    if(c2 == c1 || c2.length == 1){
      this.isImgChar = false;
      return c2;
    }
    this.isImgChar = true;
    if(this.layout.charImgColor=="white"){
      c2 = "w_" + c2;
    }
    return this.makeCharImgTag(Filename.concat(this.layout.charImgRoot, c2));
  };

  StreamParser.prototype.makeCharImgTag = function(imgPath){
    var width = Math.floor(this.layout.fontSize * this.fontScale);
    var height = width;

    var css = {
	"vertical-align":"top",
	"width": width + "px",
	"height": height + "px",
	"line-height": height + "px",
	"margin":"0",
	"padding":"0",
        "border-width":"0"
    };
    var attr = {
	"src": imgPath,
	"style": inlineCss(css)
    };
    return tagStart("img", attr, true);
  };

  StreamParser.prototype.getBoutenStr = function(tagName){
    switch(tagName){
      case "bt-disc": return "・";
      case "bt-accent": return "ヽ";
      case "bt-circle": return "。";
      case "bt-dot": return "・";
    }
    return "・";
  };

  StreamParser.prototype.parseAttr = function(html){
    var tmp = html.split(/[\s\t　]+/);
    var ret = {};
    var self = this;
    for(var i = 0; i < tmp.length; i++)(function (v,i){
      if(v.match(/([^=]+)=(.+)/)){
	var name = RegExp.$1;
	var value = self.cutQuote(RegExp.$2);
	ret[name] = value;
      }
    })(tmp[i],i);
    return ret;
  };

  StreamParser.prototype.cutQuote = function(src){
    return src.replace(/\"/g, "").replace(/\'/g, "");
  };

  StreamParser.prototype.startBgColor = function(){
    if(this.layout.isV){
      var yohaku = Math.floor(this.layout.yohakuHeight * this.lineScale);
      var pTB = Math.floor(yohaku / 3);
      var width = Math.floor(this.layout.baseLineHeight * this.lineScale);
      var css = {"text-align":"center", "padding": pTB + "px 0", "width": width + "px", "background-color": this.bgColor};
      return tagStart("div", {"style":inlineCss(css)}, false);
    } else {
      var css = {"padding-top":"0.3em","padding-left":"0.3em","vertical-align":"middle","background-color": this.bgColor};
      return tagStart("span", {"style":inlineCss(css)}, false);
    }
  };

  StreamParser.prototype.endBgColor = function(){
    if (this.layout.isV){
      return "</div>";
    }
    return "</span>";
  };

  StreamParser.prototype.makeLineTd = function(){
    if (this.boutenCount > 0){
      this.boutenStack.push({startPos:this.boutenStartPos, count:this.boutenCount, str:this.boutenStr});
      this.boutenCount = 0;
      this.boutenStartPos = 0;
    }
    var bodyHeight = Math.floor(this.layout.fontSize * this.lineScale);
    var yohakuHeight = Math.floor(this.layout.yohakuHeight * this.lineScale);
    var lineHeight = bodyHeight + yohakuHeight;
    var cssBody = {
	"font-size": this.layout.fontSize + "px",
	"margin": "0",
	"padding": "0",
	"text-align":(this.lineScale>1)? "center" : "left",
	"line-height": this.layout.letterHeight + "px",
	"vertical-align": "top",
	"width": bodyHeight + "px"
    };
    var cssRuby = {
	"margin": "0",
	"padding": "0",
	"text-align":"left",
	"width":yohakuHeight + "px",
	"vertical-align": "top"
    };
    return (tagStart("td", {"style": inlineCss(cssBody)}, false) +  this.lineBuff + "</td>" +
	    tagStart("td", {"style": inlineCss(cssRuby)}, false) +  this.makeRubyLine() + this.makeBoutenLine() + "</td>");
  };

  StreamParser.prototype.makeRubyLine = function(){
    var ret = "";
    var self = this;
    var rubyFontSize = Math.floor(this.layout.rubyFontSize * this.lineScale);
    var css = {
	"position": "absolute",
	"font-size":rubyFontSize + "px",
	"line-height":"1.14em"
    };
    var baseStyle = inlineCss(css);
    var indentOffset = this.indentCount * this.layout.letterHeight;
    var nextStack = [];
    var maxRubyH = this.layout.height - Math.floor(this.fontScale * this.layout.letterHeight * 2);
    
    for (var i = 0; i < this.rubyStack.length; i++){
      var ruby = this.rubyStack[i];
      var mtop = Math.floor(indentOffset + ruby.startPos);
      var style = baseStyle + "margin-top:" + mtop + "px;";
      var h = mtop;
      ret += tagStart("div", {"style":style}, false);
      for (var k = 0; k < ruby.yomi.length; k++){
	var y = ruby.yomi.substring(k,k+1);
	ret += self.makeCharInner(y) + "<br />";
	h += rubyFontSize;
	if(h >= maxRubyH){
	  nextStack.push({yomi:ruby.yomi.slice(k+1), startPos:0});
	  break;
	}
      }
      ret += "</div>";
    }

    this.rubyStack = nextStack;
    return ret;
  };

  StreamParser.prototype.makeLineH = function(){
    var ret = "";
    if(this.rubyStack.length > 0){
      ret += this.makeRubyLineH();
    }
    ret += "<div>";
    ret += this.lineBuff + "<br />";
    if(this.fontStyle!=""){
      ret += "</span>";
    }
    if(this.bgColor!=""){
      ret += this.endBgColor();
    }
    ret += "</div>";
    return ret;
  };

  StreamParser.prototype.makeRubyLineH = function(){
    var ret = "";
    var self = this;
    var indentOffset = this.indentCount * this.layout.letterHeight;
    var rfs = Math.floor(this.layout.rubyFontSize * this.lineScale);
    var css = {
	"font-size": rfs + "px",
        "margin": "0",
	"padding": "0",
	"line-height": rfs + "px"
    };
    ret += tagStart("div", {style:inlineCss(css)}, false);

    for (var i = 0; i < this.rubyStack.length; i++)(function (i, ruby){
      var style = "position:absolute; margin-top:-0.3em; margin-left:" + Math.floor(indentOffset + ruby.startPos) + "px;";
      ret += tagStart("span", {"style":style}, false);
      for (var k = 0; k < ruby.yomi.length; k++)(function (k, y){
	ret += y;
      })(k, ruby.yomi.substring(k,k+1));
      ret += "</span>";
    })(i, this.rubyStack[i]);

    this.rubyStack = [];
    ret += "</div>";
    return ret;
  };

  StreamParser.prototype.makeBoutenLine = function(){
    var ret = "";
    var self = this;
    var css = {
	"position": "absolute",
	"margin-left": "-0.35em"
    };
    var baseStyle = inlineCss(css);

    for (var i = 0; i < this.boutenStack.length; i++)(function (bouten){
      while( bouten.count > 0 ){
	if (bouten.str == "・"){
	  var boutenFontSize = self.layout.fontSize;
	} else if (bouten.str == "ヽ"){
	  var boutenFontSize = Math.floor(self.layout.fontSize * 70 / 100);
	}
	var style = baseStyle + "; font-size:" + boutenFontSize + "px; margin-top:" + bouten.startPos + "px;";
	ret += tagStart("div", {"style":style}, false);
	ret += bouten.str;
	ret += "</div>";
	bouten.startPos += self.layout.letterHeight;
	bouten.count--;
      }
    })(this.boutenStack[i]);
    
    this.boutenStack = [];
    return ret;
  };

  StreamParser.prototype.normalIndent = function(str){
    this.isHankaku = false;
    this.isSmall = false;
    if (this.lineScale <= 1){
      if (str.match(/[a-z0-9]+/i)){
	this.isHankaku = true;
	var style = (str.length > 1)? "line-height:1em" : "line-height:1em; margin-left:0.25em";
	return tagStart("span", {style:style}, false) + str + "</span><br />";
      }
    }
    if (str.match(/[ぁァぃィぅゥぇェぉォヵヶっッゃャゅュょョゎヮ]/)){
      this.isSmall = true;
      var style = "overflow:visible;position:relative;top:-0.15em;right:-0.08em;line-height:1em;";
      return tagStart("span", {"style":style}, false) + str + "</span><br />";
    }
    return this.makeCharInner(str) + "<br />";
  };

  StreamParser.prototype.toBold = function(str){
    return ("<b>" + str + "</b>");
  };

  StreamParser.prototype.toStyle = function(css){
    return (function(str){
      return ("<span style='" + css + "'>" + str + "</span>");
    });
  };

  StreamParser.prototype.toLink = function(attr){
    return (function(str){
      return ("<a " + inlineAttr(attr) + ">" + str + "</a>");
    });
  };

  StreamParser.prototype.isHeadNg = function(s){
    for(i = 0; i < this.layout.headNgChars.length; i++){
      if(s == this.layout.headNgChars[i]){
	return true;
      }
    }
    return false;
  };

  StreamParser.prototype.isTailNg = function(s){
    for(i = 0; i < this.layout.tailNgChars.length; i++){
      if(s == this.layout.tailNgChars[i]){
	return true;
      }
    }
    return false;
  };

  StreamParser.prototype.applyTagStack = function(str, indent){
    var ret = indent? this.normalIndent(str) : str;
    for(i = this.tagStack.length - 1; i >= 0 ; i--){
      var f = this.tagStack[i];
      ret = f(ret);
    }
    return ret;
  };

  StreamParser.prototype.isValidPageRange = function(page){
    return (0 <= page && page < this.seekTable.length);
  };

  StreamParser.prototype.setSeekPage = function(page){
    if(this.isValidPageRange(page)){
      this.textStream.seekPos = this.seekTable[page].spos;
      this.seekWidth = 0;
      this.seekHeight = 0;
      this.seekLineCharCount = 0;
      if( page == 0 ){
	this.tagStack = [];
      }
    }
  };

  StreamParser.prototype.getPageSeekPos = function(page){
    if(this.isValidPageRange(page)){
      return this.seekTable[page];
    }
    return 0;
  };

  StreamParser.prototype.getSeekPercent = function(page){
    if (page < this.seekTable.length - 1){
      return Math.floor(100 * this.seekTable[page + 1].spos / this.textStream.length);
    }
    return 100;
  };

  StreamParser.prototype.getPageSourceText = function(page){
    if (page < this.seekTable.length){
      var from = this.seekTable[page].spos;
      if (page + 1 < this.seekTable.length){
	var to = this.seekTable[page + 1].spos;
	return this.textStream.buffer.substring(from, to);
      }
    }
    return "";
  };

  StreamParser.prototype.getPageNoFromSeekPos = function(seekPos){
    for(var i = 0; i < this.seekTable.length - 1; i++){
      if(this.seekTable[i].spos <= seekPos && seekPos < this.seekTable[i+1].spos){
	return i;
      }
    }
    if(this.seekTable[i].spos <= seekPos && seekPos <= this.textStream.buffer.length){
      return i;
    }
    return -1;
  };

  StreamParser.prototype.makeRestSpaceTd = function(){
    var restWidth = this.layout.width - this.seekWidth;
    var restTd = "";
    if(restWidth > 0){
      restTd = "<td style='display:block; width:" + restWidth + "px; height:" + this.layout.height + "'></td>\n";
    }
    return restTd;
  };

  StreamParser.prototype.getPageSeekPos = function(page){
    if(this.isValidPageRange(page)){
      return this.seekTable[page];
    }
    return {spos:0, cpos:0};
  };

  StreamParser.prototype.saveSeekState = function(page, seekData){
    if(this.isValidPageRange(page)){
      this.seekTable[page] = seekData;
    } else {
      this.seekTable.push(seekData);
    }
  };

  StreamParser.prototype.fixH = function(c){
    if(c == "―"){
      return "<span style='margin-top:-0.2em; float:right'>" + c + "</span>";
    }
    return c;
  };

  StreamParser.prototype.fixW = function(c){
    if(c == "―" || c == "…"){
      return "<span style='margin-left:-0.24em'>" + c + "</span>";
    }
    return c;
  };

  StreamParser.prototype.hasNextPage = function(){
    return (this.textStream.seekPos < this.textStream.length);
  };

  StreamParser.prototype.addCache = function(page, pageHtml){
    this.pageCache[page] = pageHtml;
  };

  StreamParser.prototype.getCache = function(page){
    return this.pageCache[page];
  };

  StreamParser.prototype.clearCache = function(){
    this.pageCache = [];
    this.tagStack = [];
  };

  StreamParser.prototype.reset = function(){
    this.clearCache();
    this.textStream.seekPos = 0;
  };

  StreamParser.prototype.getLetterCount = function(c){
    if(escape(c).charAt(1) == "u"){
      return 1;
    } else {
      if(!this.layout.isV){
	return 0.5;
      } else {
	return (c == " ")? 1 : Env.canTransform? 0.5 : 1;
      }
    }
  };

  StreamParser.prototype.addIndent = function(count){
    var space = (this.layout.isV)? "　<br />" : "　";
    for(var i = 0; i < count; i++){
      this.lineBuff += space;
    }
  };

  StreamParser.prototype.getLayout = function(){
    return this.layout;
  };

  StreamParser.prototype.setLayout = function(layout){
    this.layout = layout;
    this.layout.initialize();
  };

  StreamParser.prototype.getAnchors = function(){
    return this.anchors;
  };

  StreamParser.prototype.getAnchorCount = function(){
    return this.anchorCount;
  };

  StreamParser.prototype.getPageLayout = function(pageNo, body){
    var t1 = "<" + this.layout.wrapTag + " class='" + this.layout.textLayerClassName + "' style='" + this.layout.wrapCss + "'>";
    var t2 = "</" + this.layout.wrapTag + ">";
    var pageHtml = (body != "")? t1 + body + t2 : "";

    this.addCache(pageNo, pageHtml);

    return pageHtml;
  };

  StreamParser.prototype.outputPage = function(pageNo){
    if (this.isResuming){
      this.isResuming = false;
      return this.parsePage(pageNo);
    } else if (typeof this.pageCache[pageNo] != "undefined"){
      this.setSeekPage(pageNo + 1);// move to head of next page.
      return this.pageCache[pageNo];
    } else {
      this.setSeekPage(pageNo);
      return this.parsePage(pageNo);
    }
  };

  StreamParser.prototype.onOverFlowPage = function(pageNo, isV){
    if(isV){
      if(this.layout.directionH == "rl"){
	this.blockBuff = this.makeRestSpaceTd() + this.blockBuff;
      } else {
	this.blockBuff = this.blockBuff + this.makeRestSpaceTd();
      }
    }
    var page = (isV)? "<tr>" + this.blockBuff + "</tr>" : this.blockBuff;
    this.saveSeekState(pageNo + 1,{spos:this.textStream.seekPos, cpos:this.seekCharCount});
    this.blockBuff = "";
    this.lineBuff = "";

    // if bg color defined, end it.
    if (this.bgColor != ""){
      this.lineBuff += this.startBgColor();
    }
    this.lineScale = this.fontScale;
    
    if(isV){
      this.seekWidth = 0;
    } else {
      this.seekHeight = 0;
    }
    this.seekLineCharCount = 0;
    
    return this.getPageLayout(pageNo, page);
  }; // onOverFlowPage

  StreamParser.prototype.onBufferEnd = function(pageNo, isV){

    // stream text already end.
    if(this.textStream.isEOF){
      if(this.lineBuff != ""){
	this.pushLine(pageNo, isV);
      }
      return this.onOverFlowPage(pageNo, isV); // final page.

    } else { // stream has more text data, and it's not still received.

      this.isResuming = true;

      // buffer end while parsing tag.
      if(this.resumePos >= 0){

	// resume parsing from position of tag start.(seek position of "<")
	this.textStream.seekPos = this.resumePos;
	this.lineBuff = this.lineSave;
      }

      // request next buffer to caller.
      throw "BufferEnd";
    }
  }; // onBufferEnd

  StreamParser.prototype.onRubyBufferEnd = function(pageNo, isV){
    delete this.rubyStream;
    this.rubyStream = null;
  };

  StreamParser.prototype.pushLineToBlockV = function(line){
    if(this.layout.directionH == "rl"){
      this.blockBuff = line + this.blockBuff;
    } else {
      this.blockBuff += line;
    }
  };

  StreamParser.prototype.pushLine = function(pageNo, isV){
    if(this.blockBuff != "" || this.lineBuff != ""){
      if (isV){
	if(this.halfBuff){
	  this.lineBuff += this.outputHalfWord();
	  if(this.getLetterCount(this.textStream.lookNextChar()) < 1){
	    this.halfWordBreak = true;
	  }
	}
    	this.pushLineToBlockV(this.makeLineTd());
      } else { // horizontal
	this.blockBuff += this.makeLineH();
      }
      this.lineBuff = "";
      if (this.fontStyle != ""){
	this.lineBuff += fontStyle;
      }
      if (this.bgColor != ""){
	this.lineBuff = this.startBgColor();
      }
      if (isV){
	this.seekWidth += Math.floor(this.layout.baseLineHeight * this.lineScale);
	this.seekHeight = 0;
      } else {
	this.seekHeight += Math.floor(this.layout.baseLineHeight * this.lineScale);
	this.seekWidth = 0;
      }
      this.seekLineCharCount = 0;
      this.lineScale = this.fontScale;
    }
  }; // pushLine

  StreamParser.prototype.checkOverflow = function(isV){
    if(isV){
      return (this.seekWidth + Math.floor(this.layout.fontSize * this.lineScale) > this.layout.width);
    }
    return (this.seekHeight + Math.floor((this.layout.fontSize + this.layout.rubyFontSize) * this.lineScale) > this.layout.height);
  };

  StreamParser.prototype.parseEndPage = function(pageNo, isV, tagStr, tagAttr, tagName){
    if(this.lineBuff != ""){
      this.pushLine(pageNo, isV);
    }
    // if recursive parser, end-page from caller one more time.
    if(this.recursiveParser){
      this.textStream.seekPos = this.resumePos;
    }
    throw "OverflowPage";
  };

  StreamParser.prototype.adjustSize= function(baseW, baseH, maxW, maxH){
    var retW = baseW;
    var retH = baseH;
    if(baseW > maxW){
      retW = maxW;
      retH -= Math.floor((baseH / baseW) * (baseW - maxW));
    }
    if(baseH > maxH){
      retH = maxH;
      retW -= Math.floor((baseW / baseH) * (baseH - maxH));
    }
    return {width:retW, height:retH};
  };

  StreamParser.prototype.parseObjectStart = function(pageNo, isV, tagStr, tagAttr, tagName){
    var width = parseInt(tagAttr.width);
    var height = parseInt(tagAttr.height);
    var align = (typeof tagAttr.align != "undefined")? tagAttr.align : "none";
    this.objFigure = {
      src:tagStr,
      align: align,
      width: width,
      height: height,
      drawWidth: width,
      drawHeight: height
    };
  };

  StreamParser.prototype.parseObjectBody = function(pageNo, isV, tagStr, tagAttr, tagName){
    if(this.objFigure){
      this.objFigure.src += tagStr;
    }
  };

  StreamParser.prototype.parseObjectEnd = function(pageNo, isV, tagStr, tagAttr, tagName){
    this.objFigure.src += tagStr;
    this.pushFigure(pageNo, isV, "object", this.objFigure);
  };

  StreamParser.prototype.parseImg = function(pageNo, isV, tagStr, tagAttr, tagName){
    var src = tagAttr.src;
    var width  = (typeof tagAttr.width != "undefined")?  parseInt(tagAttr.width) : 200;
    var height = (typeof tagAttr.height != "undefined")? parseInt(tagAttr.height) : 300;
    var align = (typeof tagAttr.align != "undefined")? tagAttr.align : "none";
    var restWidth = this.layout.width - this.seekWidth;
    var restHeight = this.layout.height - this.seekHeight;
    var marginSize = this.layout.letterHeight * 2;

    if(isV){
      restHeight = Math.max(10, restHeight - marginSize);
    } else {
      restWidth  = Math.max(10, restWidth  - marginSize);
    }
    var drawSize = this.adjustSize(width, height, restWidth, restHeight);
    
    this.pushFigure(pageNo, isV, "img", {
      src:src,
      align:align,
      width:width,
      height:height,
      drawWidth:drawSize.width,
      drawHeight:drawSize.height
    });
  }; // parseImg

  StreamParser.prototype.pushFigure = function(pageNo, isV, tagName, fig){

    // if current line is not empty, push as new line before image.
    if(this.lineBuff != ""){
      this.pushLine(pageNo, isV);
      if(this.checkOverflow(isV)){
	this.textStream.seekPos = this.resumePos;
	throw "OverflowPage";
      }
    }

    // when parsing document while recursive parsing... force overflow, and process this img at the next new page.
    if(this.recursiveParser){
      if(this.lineBuff != ""){
	this.pushLine(pageNo, isV);
      }
      this.textStream.seekPos = this.resumePos;
      throw "OverflowPage";
    }

    // if figure is larger than layout size, just ignore it.
    if((isV && fig.width > this.layout.width) || (!isV && fig.height > this.layout.height)){
      return;
    }
    
    // if enough space not left for figure size, write it in next page.
    if ((isV && this.seekWidth + fig.drawWidth + this.layout.yohakuHeight > this.layout.width) ||
	(!isV && this.seekHeight + fig.drawHeight + this.layout.yohakuHeight > this.layout.height)){
      this.textStream.seekPos = this.resumePos;
      throw "OverflowPage";
    }

    // if figure is resized and smaller than half size of original, write it in next page.
    if((fig.drawWidth != fig.width || fig.drawHeight != fig.height) &&
       (fig.drawWidth * 2 < fig.width || fig.drawHeight * 2 < fig.height)){
      this.textStream.seekPos = this.resumePos;
      throw "OverflowPage";
    }
      
    // white space size
    if(isV){
      var restSize = this.layout.height - fig.drawHeight - this.layout.fontSize;
    } else {
      var restSize = this.layout.width - fig.drawWidth - this.layout.fontSize;
    }
    var inlinePage = "";

    if(isV){
      if(!this.textStream.isEOF || fig.align == "none" || restSize <= 0 || restSize * 2 < this.layout.height){
	if(tagName == "img"){
	  var figTag = tagStart("img", {"src":fig.src, "width":fig.drawWidth, "height":fig.drawHeight}, true);
	} else {
	  var figTag = fig.src;
	}
	figTag = this.applyTagStack(figTag, false);
      } else {
	if(fig.align == "top" || fig.align == "left"){
	  var style = "padding:0; margin-bottom:" + this.layout.fontSize + "px;";
	} else if(fig.align == "bottom" || fig.align == "right"){
	  var style = "padding:0; margin-top:0;";
	}
	if(tagName == "img"){
	  var figTag = tagStart("img", {src:fig.src, width:fig.drawWidth, height:fig.drawHeight, style:style}, true);
	} else {
	  var figTag = tagStart("div", {style:style}, false) + fig.src + "</div>";
	}

	figTag = this.applyTagStack(figTag, false);

	// recursive output for white space(textStream is shared).
	var parserTmp = new StreamParser(new Layout({
	  width: fig.drawWidth,
	  height: restSize,
	  fontSize: this.layout.fontSize,
	  direction: this.layout.direction,
	  charImgRoot: this.layout.charImgRoot,
	  charImgMap: this.layout.charImgMap,
	  charImgColor: this.layout.charImgColor,
	  kinsokuCharCount: this.layout.kinsokuCharCount
	}), this.textStream);

	// set recursive flag. it makes this parser force turn page when it meets resursive image while recursive parsing.
	parserTmp.recursiveParser = true;

	if(this.layout.fontFamily){
	  parserTmp.layout.fontFamily = this.layout.fontFamily;
	  parserTmp.layout.initialize();
	}
	inlinePage = parserTmp.parsePage(0);

	// inherit tag stack
	this.tagStack = parserTmp.tagStack;
	
	delete parserTmp;
      }
      var tdCss = { "vertical-align":"top", "padding-right":this.layout.yohakuHeight + "px"};
      var tdBody = (fig.align == "top" || fig.align == "left")? figTag + inlinePage : inlinePage + figTag;
      this.blockBuff = tagStart("td", {"style":inlineCss(tdCss)}, false) + tdBody + "</td>" + this.blockBuff;
      this.seekWidth += fig.drawWidth + this.layout.yohakuHeight;
      
    } else { // horizontal
      if(!this.textStream.isEOF || fig.align == "none" || restSize <= 0 || restSize * 2 < this.layout.width){
	if(tagName == "img"){
	  var figTag = tagStart("img", {"src":fig.src, "width":fig.drawWidth, "height":fig.drawHeight}, true);
	} else {
	  var figTag = fig.src;
	}
	this.blockBuff += figTag + "<br />";
	this.seekHeight += fig.drawHeight + this.layout.yohakuHeight;
      } else {
	if(tagName == "img"){
	  var figTag = tagStart("img", {"src":fig.src, "width":fig.drawWidth, "height":fig.drawHeight}, true);
	} else {
	  var figTag = fig.src;
	}

	// recursive output for white space(textStream is shared).
	var parserTmp = new StreamParser(new Layout({
	  width: restSize,
	  height: fig.drawHeight,
	  fontSize: this.layout.fontSize,
	  direction:"horizontal",
	  charImgRoot: this.layout.charImgRoot,
	  charImgMap: this.layout.charImgMap,
	  charImgColor: this.layout.charImgColor,
	  kinsokuCharCount: 1
	}), this.textStream);

	// set recursive flag. it makes this parser force turn page when it meets resursive image while recursive parsing.
	parserTmp.recursiveParser = true;

	if(this.layout.fontFamily){
	  parserTmp.layout.fontFamily = this.layout.fontFamily;
	  parserTmp.layout.initialize();
	}
	
	inlinePage = parserTmp.parsePage(0);
	delete parserTmp;

	if(fig.align == "top" || fig.align == "left"){
	  var leftBlock  = "<div style='float:left; width:" + (fig.drawWidth + this.layout.fontSize) + "px;'>" + figTag + "</div>";
	  var rightBlock = "<div style='float:left; width:" + restSize + "px;'>" + inlinePage + "</div>";
	} else if(fig.align == "bottom" || fig.align == "right"){
	  var leftBlock  = "<div style='float:left; width:" + restSize + "px;'>" + inlinePage + "</div>";
	  var rightBlock = "<div style='float:left; width:" + (fig.drawWidth + this.layout.fontSize) + "px;'>" + figTag + "</div>";
	}
	this.blockBuff += ("<div style='width:" + this.layout.width + "px;'>" +
			   leftBlock + rightBlock +
			   "<div style='clear:left;line-height:0px;font-size:0px;'></div>" +
			   "</div>");
	this.seekHeight += fig.drawHeight + this.layout.yohakuHeight;
      }
    }
  }; // pushFigure

  StreamParser.prototype.parseLinkStart = function(pageNo, isV, tagStr, tagAttr, tagName){
    if(tagName == "a2"){
      tagAttr.target = "_blank";
    }
    // is anchor?
    if(tagAttr.name){
      this.anchorName = tagAttr.name;
      this.anchors[this.anchorName] = {title:"", pageNo:pageNo};
      this.anchorCount++;
    } else {
      if (isV){
	this.tagStack.push(this.toLink(tagAttr));
      } else {
	this.lineBuff += "<a " + inlineAttr(tagAttr) + ">";
      }
    }
  };

  StreamParser.prototype.parseLinkEnd = function(pageNo, isV, tagStr, tagAttr, tagName){
    if(this.anchorName != ""){
      this.anchorName = "";
    } else {
      if(isV){
	this.tagStack.pop();
      } else if(tagName == "/a2"){
	this.lineBuff += "</a>";
      } else {
	this.lineBuff += tagStr;
      }
    }
  };

  StreamParser.prototype.parseBoldStart = function(pageNo, isV, tagStr, tagAttr, tagName){
    if (isV){
      this.tagStack.push(this.toBold);
    } else {
      this.lineBuff += tagStr;
    }
  };

  StreamParser.prototype.parseBoldEnd = function(pageNo, isV, tagStr, tagAttr, tagName){
    if(isV){
      this.tagStack.pop();
    } else {
      this.lineBuff += tagStr;
    }
  };

  StreamParser.prototype.parseFontStart = function(pageNo, isV, tagStr, tagAttr, tagName){
    var css = {};

    this.fontScale = (typeof tagAttr.scale != "undefined")? parseFloat(tagAttr.scale) : 1;
    if (this.fontScale < 1 || this.fontScale > 1 ){
      css["font-size"] = this.fontScale + "em";
      if (isV){
	css["line-height"] = "1.1em";
      }
    }

    // line scale follows max font scale.
    if (this.fontScale > this.lineScale){
      this.lineScale = this.fontScale;
    }
    
    if (typeof tagAttr.color != "undefined"){
      css["color"] = tagAttr.color;
    }
    
    if (typeof tagAttr.family != "undefined"){
      css["font-family"] = tagAttr.family;
    }

    if (typeof tagAttr.weight != "undefined"){
      css["font-weight"] = tagAttr.weight;
    }
    
    this.bgColor = (typeof tagAttr.bgcolor != "undefined")? tagAttr.bgcolor : "";
    if (this.bgColor != ""){
      this.lineBuff += this.startBgColor();
    }
    
    var style = inlineCss(css);
    if (style != ""){
      style += "vertical-align:baseline;";
      if(isV){
	this.tagStack.push(this.toStyle(style));
      } else {
	this.fontStyle = tagStart("span", {"style":style}, false);
	this.lineBuff += this.fontStyle;
      }
    }
  }; // parseFontStart

  StreamParser.prototype.parseFontEnd = function(pageNo, isV, tagStr, tagAttr, tagName){
    this.fontScale = 1;
    
    // if parser mets "</font>" on head of line, we can't reset previous lineScale forever.
    if(this.seekLineCharCount == 0){
      this.lineScale = 1;
    }
    
    if(isV){
      if (this.bgColor != ""){
	this.lineBuff += this.endBgColor(); // end bg color.
	this.bgColor = "";
      }
      this.tagStack.pop();
    } else {
      this.fontStyle = "";
      this.lineBuff += "</span>"; // end font style.
      if (this.bgColor != ""){
	this.lineBuff += this.endBgColor(); // end bg color.
	this.bgColor = "";
      }
    }
  }; // parseFontEnd

  StreamParser.prototype.parseBoutenStart = function(pageNo, isV, tagStr, tagAttr, tagName){
    this.bouten = true;
    this.boutenStartPos = this.seekHeight;
    if(Env.isIE){
      this.boutenStartPos += Math.floor(this.layout.baseLetterSpacing * this.fontScale);
    }
    this.boutenStr = this.getBoutenStr(tagName);
  };

  StreamParser.prototype.parseBoutenEnd = function(pageNo, isV, tagStr, tagAttr, tagName){
    this.bouten = false;
    this.boutenStack.push({startPos:this.boutenStartPos, count:this.boutenCount, str:this.boutenStr});
    this.boutenCount = 0;
  };

  StreamParser.prototype.parsePackStart = function(pageNo, isV, tagStr, tagAttr, tagName){
    if(isV){
      this.packStr = "";
    }
  };
  
  StreamParser.prototype.parseRubyStart = function(pageNo, isV, tagStr, tagAttr, tagName){
    if(isV){
      this.rubyStream = new RubyStream(this.seekHeight);
    } else {
      this.rubyStream = new RubyStream(this.seekWidth);
    }
  };

  StreamParser.prototype.parseRubyEnd = function(pageNo, isV, tagStr, tagAttr, tagName){
    this.rubyStack.push({yomi:this.rubyStream.yomi, startPos:this.rubyStream.rubyStartPos});
    this.rubyStream.setReady();
  };

  StreamParser.prototype.parseBlockquoteStart = function(pageNo, isV, tagStr, tagAttr, tagName){
    this.blockIndentCount = (typeof tagAttr.indent != "undefined")? parseInt(tagAttr.indent) : 2;
    this.indentCount += this.blockIndentCount;
    if(this.lineCount <= this.indentCount * 2){
      this.activateTag("blockquote", false);
    }
    this.layout.lineCount -= this.blockIndentCount * 2;
  };

  StreamParser.prototype.parseBlockquoteEnd = function(pageNo, isV, tagStr, tagAttr, tagName){
    this.indentCount -= this.blockIndentCount;
    this.layout.lineCount += this.blockIndentCount * 2;
    this.blockIndentCount = 0;
  };

  StreamParser.prototype.parseTagHook = function(pageNo, isV, tagStr, tagAttr, tagName, isStart){
    if(ParserHook.enableTagHook(tagName)){
      ParserHook.getTagHook(tagName).apply(this, [pageNo, isV, tagStr, tagAttr, tagName]);
      //ParserHook.getTagHook(tagName)(this, pageNo, isV, tagStr, tagAttr, tagName);
    }
  };

  StreamParser.prototype.parseTag = function(pageNo, isV){
    
    var tagStr = this.textStream.getTag();
    var tagInner = tagStr.replace("<","").replace(">","").replace("/>","");
    var tagAttr = this.parseAttr(tagInner);
    var tagName = tagInner.split(/[\s\t]+/)[0].toLowerCase();
    var isEnd = (tagName.substring(0,1) == "/");
    
    this.activateTag(tagName.replace("/",""), !isEnd);

    switch (tagName) {
      case "end-page":
        this.parseEndPage(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "img":
        this.parseImg(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "a": case "a2":
        this.parseLinkStart(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "/a": case "/a2":
        this.parseLinkEnd(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "b": case "strong":
        this.parseBoldStart(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "/b": case "/strong":
        this.parseBoldEnd(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "font":
        this.parseFontStart(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "/font":
        this.parseFontEnd(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "bt-disc": case "bt-accent": case "bt-circle": case "bt-dot":
        this.parseBoutenStart(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "/bt-disc": case "/bt-accent": case "/bt-circle": case "/bt-dot":
        this.parseBoutenEnd(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "pack":
        this.parsePackStart(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "ruby":
        this.parseRubyStart(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "/ruby":
        this.parseRubyEnd(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "blockquote":
        this.parseBlockquoteStart(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "/blockquote":
        this.parseBlockquoteEnd(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "object":
        this.parseObjectStart(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "/object":
        this.parseObjectEnd(pageNo, isV, tagStr, tagAttr, tagName);
        break;

      case "embed" : case "/embed" : case "param": case "/param":
        this.parseObjectBody(pageNo, isV, tagStr, tagAttr, tagName);
        break;
      
      default:
        this.parseTagHook(pageNo, isV, tagStr, tagAttr, tagName);
        break;
    }
  }; // parseTag

  StreamParser.prototype.checkTailNg = function(pageNo, isV){

    // nomally, s2 is tail charactor of curent line.
    var s2 = this.textStream.lookNextChar();

    // [TODO] if s2 is "<", fail to check tail NG.

    if(this.isTailNg(s2)){
      this.pushLine(pageNo, isV);
      this.textStream.skipCRLF();
    }
  }; // checkTailNg

  StreamParser.prototype.checkHeadNg = function(pageNo, isV){

    // nomally, s2 is head charactor of next line.
    var s2 = this.textStream.lookNextChar();

    if(this.isHeadNg(s2)){
      this.textStream.stepSeekPos();
      this.seekCharCount++;
      if (this.bouten){
	this.boutenCount++;
      }

      // add s2 to current line.
      if(isV){
	this.lineBuff += this.applyTagStack(s2, true);
      } else {
	this.lineBuff += this.fixW(s2);
      }

      // check one more charactor for double tail NG. ex:  。」 or ？」
      var s3 = this.textStream.lookNextChar();

      // double NG
      if(this.isHeadNg(s3)){
	this.textStream.stepSeekPos();
	this.seekCharCount++;
	if (this.bouten){
	  this.boutenCount++;
	}
	this.lineBuff += this.applyTagStack(s3, true);
      }
    }
    this.pushLine(pageNo, isV);
    this.textStream.skipCRLF();
  }; // checkHeadNg

  StreamParser.prototype.outputHalfWord = function(){
    if(this.halfBuff.length == 1){
      var ret = this.applyTagStack(this.halfBuff, true);
    } else if(this.halfBuff.length == 2 && !this.halfWordBreak && (this.halfBuff.match(/\d+/) || this.halfBuff.match(/[!\?]+/))){
      var ret = this.applyTagStack(this.halfBuff, true);
    } else if (Env.isIE){
      var css = inlineCss({
	  "writing-mode":"tb-rl",
	  "width": this.layout.fontSize + "px"
      });
      var ret = "<div class='hw-tbrl' style='" + css + "'>" + this.applyTagStack(this.halfBuff, false) + "</div>";
    } else {
      var halfSize = this.fontScale * this.layout.fontSize / 2;
      var margin = Math.max(0, Math.floor((this.halfBuff.length - 2) * halfSize));
      var css = inlineCss({
	  "-webkit-transform":"rotate(90deg)",
	  "-webkit-transform-origin":"50% 50%",
	  "-moz-transform":"rotate(90deg)",
	  "-moz-transform-origin":"50% 50%",
	  "margin-bottom": margin + "px",
	  "width": this.layout.fontSize + "px"
      });
      var ret = "<div class='hw-trans' style='" + css + "'>" + this.applyTagStack(this.halfBuff, false) + "</div>";
    }
    delete this.halfBuff;
    this.halfBuff = null;
    this.halfWordBreak = false;
    return ret;
  };

  StreamParser.prototype.pushHalfChar = function(s1){
    if(this.halfBuff){
      this.halfBuff += s1;
    } else {
      this.halfBuff = s1;
    }
    var s2 = this.textStream.lookNextChar();
    if(this.getLetterCount(s2) >= 1 || s2 == "<" || s2 == " " || s2 == "　" || s2 == "\t" || s2 == "\r" || s2 == "\n"){
      this.lineBuff += this.outputHalfWord();
    }
  };

  StreamParser.prototype.pushChar = function(pageNo, isV, s1){

    if(this.anchorName != ""){
      this.anchors[this.anchorName].title += s1;
    }

    var letterCount = this.getLetterCount(s1); // 0.5 or 1.0
    var scaleWeight = letterCount * this.fontScale;

    // head of line, and defined indent count.
    if(this.seekLineCharCount == 0 && this.indentCount > 0) {
      this.addIndent(this.indentCount);
    }

    // add one char to current line.
    if(isV){
      if(letterCount < 1 && Env.canTransform){
	this.pushHalfChar(s1);
      } else {
	this.lineBuff += this.applyTagStack(s1, true);
      }

      if(this.isImgChar){
	this.seekHeight += Math.floor(scaleWeight * this.layout.fontSize);
      } else if(this.isHankaku || this.isSmall){
	this.seekHeight += Math.floor(scaleWeight * this.layout.fontSize);
      } else {
	this.seekHeight += Math.floor(scaleWeight * this.layout.letterHeight);
      }
    } else {
      this.lineBuff += this.fixW(s1);
      this.seekWidth += Math.floor(scaleWeight * this.layout.fontSize);
    }

    this.seekLineCharCount += scaleWeight;
    this.seekCharCount++;

    if (this.bouten){
      this.boutenCount++;
    }

    var restCharCount = this.layout.lineCount - this.seekLineCharCount;

    if(1 <= restCharCount && restCharCount <= 1.5){
      this.checkTailNg(pageNo, isV);
    }
    else if(restCharCount < 1){
      this.checkHeadNg(pageNo, isV);
    }
  }; // pushChar
  
  StreamParser.prototype.parsePage = function(pageNo){
    
    var isV = this.layout.isV;
    this.lineSave = "";

    while(true){
      try {
	this.resumePos = -1;
	var prevSeekPos = this.textStream.seekPos;

	if(!this.pack && this.packStr != ""){
	  var s1 = this.packStr;
	  this.packStr = "";
	} else if(this.rubyStream && this.rubyStream.isReady()){
	  var s1 = this.rubyStream.getchar();
	} else {
	  var s1 = this.textStream.getchar();
	}
	
	if (s1 == "\r"){ // CR
	} else if (s1 == "\n"){ // LF
	  this.pushLine(pageNo, isV);
	} else if (s1 == "<"){ // start tag

          // stock before parsing tag
	  this.lineSave = this.lineBuff;
	  this.resumePos = prevSeekPos;

	  // and parse tag
	  this.parseTag(pageNo, isV);
	} else if (this.isActiveTag("pack")){ // now packing more than 1charactor for space only one charactor.
	  this.packStr += s1;
	} else if (this.isActiveTag("ruby")){
	  if(this.isActiveTag("rt")){ // yomi
	    this.rubyStream.addYomi(s1);
	  } else if(this.isActiveTag("rb")){ // kanji
	    this.rubyStream.addKanji(s1);
	  }
	} else if (this.isActiveTag("script")){ // script tag is ignored.
	} else {
	  this.pushChar(pageNo, isV, s1);
	}
	if(this.checkOverflow(isV)){
	  throw "OverflowPage";
	}
      } catch (e) {
	if (e == "RubyBufferEnd"){ // ruby kanji stream ends.
	  this.onRubyBufferEnd(pageNo, isV);
	} else if (e == "OverflowPage"){ // page is filled.
	  return this.onOverFlowPage(pageNo, isV);
	} else if (e == "BufferEnd"){ // text stream ends.
	  return this.onBufferEnd(pageNo, isV);
	}
      }
    }
  }; // parsePage

  var LayoutParamParser = {
    parse : function(param){
      var list = param.split(/[\s\t]/);
      var ret = {
	direction:"vertical",
	fontSize:16,
	width: 400,
	height: 300,
	order: 0,
	charImgColor:"black",
	kinsokuCharCount:1,
	isSinglePaging:false,
	isBreak:false
      };

      for(var i=0; i< list.length; i++){
	var klass = list[i];
	if(klass == "lp-vertical" || klass == "lp-vertical-rl"){
	  ret.direction = "vertical";
	} else if (klass == "lp-vertical-lr"){
	  ret.direction = "vertical-lr";
	} else if (klass == "lp-horizontal"){
	  ret.direction = "horizontal";
	} else if (klass.match(/span-([0-9]+)/)){ // blueprint.css
	  ret.width = parseInt(RegExp.$1) * 40 - 10;
	} else if (klass.match(/lp-width-([0-9]+)/)){
	  ret.width = parseInt(RegExp.$1);
	} else if (klass.match(/lp-height-([0-9]+)/)) {
	  ret.height = parseInt(RegExp.$1);
	} else if (klass.match(/lp-font-size-([0-9]+)/)){
	  ret.fontSize = parseInt(RegExp.$1);
	} else if (klass.match(/lp-order-([0-9]+)/)){
	  ret.order = parseInt(RegExp.$1);
	} else if (klass.match(/lp-char-img-white/)){
	  ret.charImgColor = "white";
	} else if (klass.match(/lp-single-paging/)){
	  ret.isSinglePaging = true;
	} else if (klass.match(/lp-kinsoku-([0-9]+)/)){
	  ret.kinsokuCharCount = parseInt(RegExp.$1);
	} else if (klass.match(/lp-break/)){
	  ret.isBreak = true;
	}
      }
      return ret;
    }
  };

  function LayoutGroup(groupName, grids, option){
    this.grids = grids.sort(function(grid1, grid2){
      return (grid1.order - grid2.order);
    });
    this.head = this.grids[0];
    var text = this.head.node.innerHTML;
    if(Env.isIE || !option.noBR){
      text = text.replace(/<br \/>/gi, "\n").replace(/<br>/gi,"\n");
    }
    this.head.node.innerHTML = "";
    this.fontFamily = option.fontFamily;
    this.onSeek = option.onSeek;
    this.onComplete = option.onComplete;
    this.charImgRoot = option.charImgRoot;
    this.groupName = groupName;
    this.gridIndex = 0;
    this.parser = new StreamParser(new Layout({
      direction:this.head.direction,
      width:this.head.width,
      height:this.head.height,
      fontSize:this.head.fontSize,
      fontFamily:this.fontFamily,
      kinsokuCharCount:1,
      letterSpacingRate: 0.1,
      charImgRoot:this.charImgRoot,
      charImgColor:this.head.charImgColor
    }), new TextStream(text, text.length, true));

    if(this.head.isSinglePaging){
      var self = this;
      this.pager = document.createElement("div");
      var nextLink = document.createElement("a");
      var prevLink = document.createElement("a");
      this.pager.className = "nehan-pager";
      nextLink.href = "/next";
      nextLink.className = "nehan-pager-link";
      prevLink.innerHTML = "PREV &gt;";
      prevLink.href = "/prev";
      prevLink.className = "nehan-pager-link";
      nextLink.onclick = function(){
	if(self.parser.hasNextPage()){
	  self.gridIndex++;
	  self.render(self.gridIndex);
	}
	return false;
      };
      prevLink.onclick = function(){
	if(self.gridIndex > 0){
	  self.gridIndex--;
	  self.render(self.gridIndex);
	}
	return false;
      };

      if(this.head.direction.match("vertical")){
	nextLink.innerHTML = "&lt; NEXT";
	prevLink.innerHTML = "PREV &gt;";
	this.pager.appendChild(nextLink);
	this.pager.appendChild(prevLink);
      } else {
	nextLink.innerHTML = "NEXT &gt;";
	prevLink.innerHTML = "&lt; PREV";
	this.pager.appendChild(prevLink);
	this.pager.appendChild(nextLink);
      }
      this.seekBar = document.createElement("div");
      this.seekBar.className = "nehan-seek-bar-wrapper";
      var s1 = this.seekBar.style;
      s1.width = this.head.width + "px";
      s1.height = "12px";
      s1.lineHeight = "12px";

      var seekBarBody = document.createElement("div");
      var s2 = seekBarBody.style;
      seekBarBody.className = "nehan-seek-bar";
      s2.width = "0%";
      s2["float"] = "right";
      s2["text-align"] = "right";
      s2["font-size"] = "10px";
      seekBarBody.innerHTML = "0%";

      this.seekBar.appendChild(seekBarBody);
    }
  };

  LayoutGroup.prototype.setGridLayout = function(grid){
    var lay = this.parser.layout;
    lay.setDirection(grid.direction);
    lay.setWidth(grid.width);
    lay.setHeight(grid.height);
    lay.setFontSize(grid.fontSize);
    lay.setCharImgColor(grid.charImgColor);
    lay.setKinsokuCharCount(grid.kinsokuCharCount);
    lay.setFontFamily(this.fontFamily);
    lay.setCharImgRoot(this.charImgRoot);
    lay.initialize();
  };

  LayoutGroup.prototype.getGrid = function(gridIndex){
    return (gridIndex < this.grids.length)? this.grids[gridIndex] : this.grids[this.grids.length-1];
  };

  LayoutGroup.prototype.render = function(gridIndex){
    this.gridIndex = gridIndex;
    var grid = (this.head.isSinglePaging)? this.head : this.getGrid(gridIndex);

    this.setGridLayout(grid);

    var output = this.parser.outputPage(gridIndex);
    var isEndPage = !this.parser.hasNextPage();
    var percent = this.parser.getSeekPercent(gridIndex);

    this.onSeek(this.groupName, percent);

    var createTextLayer = function(klass){
      var div = document.createElement("div");
      div.className = klass;
      div.innerHTML = output;
      return div;
    };

    if(output != ""){
      var klass = "text-layer-wrapper";
      if(gridIndex == 0){
	klass += " text-layer-header";
      }
      if(isEndPage){
	klass += " text-layer-footer";
      }
      if(this.head.isSinglePaging){
	if(typeof this.pagerInit == "undefined"){
	  this.pagerInit = true;
	  isEndPage = true;
	  this.textLayer = createTextLayer(klass);
	  this.textLayer.style.height = this.head.height + "px";
	  grid.node.appendChild(this.pager);
	  grid.node.appendChild(this.textLayer);
	  grid.node.appendChild(this.seekBar);
	} else {
	  this.textLayer.innerHTML = output;
	}
	var sb = this.seekBar.firstChild;
	sb.style.width = Math.max(20, Math.floor(percent)) + "%";
	sb.innerHTML = percent + "%";
      } else if(gridIndex < this.grids.length){
	grid.node.innerHTML = "<div class='" + klass + "'>" + output + "</div>";
      } else {
	grid.node.appendChild(createTextLayer(klass));
      }
    }

    if(isEndPage || grid.isBreak){
      LayoutMapper.setFinish(this.groupName);
      this.onComplete(this.groupName, LayoutMapper.getSeekPercent());
      LayoutMapper.checkFinish();
    } else if(!this.head.isSinglePaging){
      var self = this;
      setTimeout(function(){ self.render(gridIndex+1);}, 0);
    }
  };
  
  var LayoutMapper = {
    setFinish : function(groupName){
      this.gridMappedCount++;
    },
    getSeekPercent : function(){
      return Math.floor(100 * this.gridMappedCount / this.gridCount);
    },
    checkFinish : function(){
      if(this.gridMappedCount >= this.gridCount){
	this.onCompleteAll();
      }
    },
    start : function(tagGroup, option){
      var defopt = {
	filter : "direction",
	noBR : false, // nomally, new line is <br>, but sometimes it's \n(when <pre> is used).
	charImgRoot : "/img/char",
	fontFamily : "IPA明朝, ＭＳ 明朝, Osaka-Mono, Hiragino Mincho Pro",
	onSeek : function(groupName, percent){}, // seek each group
	onComplete : function(groupName, percent){}, // complete each group
	onCompleteAll : function(){} // complete all group (enable only when filter is 'direction')
      };
      if(typeof option == "undefined"){
	option = {};
      }
      for(var prop in defopt){
	if(prop == "onCompleteAll"){
	  this[prop] = (typeof option[prop] != "undefined")? option[prop] : defopt[prop];
	} else {
	  option[prop] = (typeof option[prop] != "undefined")? option[prop] : defopt[prop];
	}
      }
      var nodes = document.getElementsByTagName(tagGroup);
      var createGridInfo = function(node, groupName, gridParam){
	var gridInfo = LayoutParamParser.parse(gridParam);
	gridInfo.node = node;
	gridInfo.tagGroup = tagGroup;
	return gridInfo;
      };

      var grids = {};
      this.gridCount = 0;
      this.gridMappedCount = 0;

      // gather layout by filter type
      for(var i=0; i < nodes.length; i++){
	var node = nodes[i];
	var matched = false;
	
	if(option.filter == "group"){ // filter by group
	  if(node.className.match(/lp-group-([a-zA-Z0-9\-_]+)/)){
	    var groupName = RegExp.$1;
	    matched = true;
	  }
	} else if (option.filter == "direction"){ // filter by writing direction
	  if(node.className.match(/lp-vertical/)){
	    var groupName = "group-v" + i;
	    matched = true;
	  } else if (node.className.match(/lp-horizontal/)){
	    var groupName = "group-h" + i;
	    matched = true;
	  }
	}

	if(matched){
	  this.gridCount++;
	  var gridParam = node.className;
	  var gridInfo = createGridInfo(node, groupName, gridParam);

	  if(typeof grids[groupName] == "undefined"){
	    grids[groupName] = [gridInfo];
	  } else {
	    grids[groupName].push(gridInfo);
	  }
	}
      }

      // render all layout group
      for(var groupName in grids){
	(new LayoutGroup(groupName, grids[groupName], option)).render(0);
      }
    }
  };

  // namespace
  Nehan.Env = Env;
  Nehan.Layout = Layout;
  Nehan.TextStream = TextStream;
  Nehan.StreamParser = StreamParser;
  Nehan.LayoutMapper = LayoutMapper;
  Nehan.ParserHook = ParserHook;

})();

