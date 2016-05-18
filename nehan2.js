/*
 source : nehan2.js
 version : 1.24
 site : http://tategakibunko.mydns.jp/
 blog : http://tategakibunko.blog83.fc2.com/

 Copyright (c) 2010, Watanabe Masaki <lambda.watanabe@gmail.com>
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

(function(){
  // ------------------------------------------------------------------------
  // BrowserDetect
  // 
  // via: http://www.quirksmode.org/js/detect.html
  // ------------------------------------------------------------------------
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

  // ------------------------------------------------------------------------
  // environment interface
  // ------------------------------------------------------------------------
  var Env = {
    init : function(){
      var browser = BrowserDetect.browser.toLowerCase();
      var version = BrowserDetect.version;
      var os = BrowserDetect.OS;

      this.isIE = (browser == "explorer");
      this.isWin = (os == "Windows");
      this.isMac = (os == "Mac");
      this.isIPhone = (navigator.platform == "iPhone");
      this.isIPad = (navigator.platform == "iPad");
      this.isIPod = (navigator.platform == "iPod");
      this.isMobileSafari = this.isIPhone || this.isIPad || this.isIPod;

      // check if browser can support transform method
      if (browser == "chrome"){
	this.canTransform = true;
      } else if (browser == "safari"){
	this.canTransform = true;
      } else if (browser == "firefox" && version >= 3.5){
	this.canTransform = true;
      } else if (browser == "opera"){
	this.canTransform = true;
      } else if (this.isIE && version >= 6.0){
	this.canTransform = true;
      } else {
	this.canTransform = false;
      }
    }
  };

  Env.init();

  // ------------------------------------------------------------------------
  // 256 color map
  // ------------------------------------------------------------------------
  var ColorMap = {
    RG : [0, 36, 73, 109, 146, 182, 219, 255],
    B : [0, 85, 170, 255],
    getRGB : function(cstr){
      return {
	r : parseInt(cstr.substring(0,2), 16),
	g : parseInt(cstr.substring(2,4), 16),
	b : parseInt(cstr.substring(4,6), 16)
      };
    },
    findNear : function(val, ary){
      if(val == 0 || val == 255){
	return val;
      }
      var min = 256;
      var ret = 0;
      for(var i = 0; i < ary.length; i++){
	var dist = Math.abs(val - ary[i]);
	if(dist < min){
	  min = dist;
	  ret = ary[i];
	}
      }
      return ret;
    },
    get : function(cstr){
      var color = this.getRGB(cstr.replace("#", ""));
      var zerofix = function(s){ return (s.length <= 1)? "0" + s : s; };
      var rs = zerofix(this.findNear(color.r, this.RG).toString(16));
      var gs = zerofix(this.findNear(color.g, this.RG).toString(16));
      var bs = zerofix(this.findNear(color.b, this.B).toString(16));
      return (rs + gs + bs).toUpperCase();
    }
  };
  
  // ------------------------------------------------------------------------
  // utility functions
  // ------------------------------------------------------------------------
  var Util = {
    filenameConcat : function(p1, p2){
      p1 = (p1=="")? "" : (p1.slice(-1) == "/")? p1 : p1 + "/";
      p2 = (p2=="")? "" : (p2[0] == "/")? p2.substring(1, p2.length) : p2;
      return p1 + p2;
    },
    readOption : function(dst, defopt, opt){
      for(prop in defopt){
	dst[prop] = (typeof opt[prop] == "undefined")? defopt[prop] : opt[prop];
      }
    },
    deepCopy : function(src){
      var dest;
      if (typeof src == 'object') {
	if (src instanceof Array) {
	  dest = new Array();
	  for (var i=0;i<src.length;i++) {
	    dest[i] = this.deepCopy(src[i]);
	  }
	} else {
	  dest = new Object();
	  for (prop in src) {
	    dest[prop] = this.deepCopy(src[prop]);
	  }
	}
      } else {
	dest = src;
      }
      return dest;
    },
    cutQuote : function(src){
      return src.replace(/\"/g, "").replace(/\'/g, "");
    },
    inlineAttr : function(attr){
      var ret = "";
      for(prop in attr){
	if(attr[prop] != ""){
	  ret += " " + prop + "='" + attr[prop] + "'";
	}
      }
      return ret;
    },
    inlineCss : function(attr){
      var ret = "";
      for(prop in attr){
	ret += prop + ":" + attr[prop] + ";";
      }
      return ret;
    },
    tagStart : function(name, attr, single){
      var ret = "<" + name;
      if(attr){
	ret += this.inlineAttr(attr);
      }
      ret += single? "/>" : ">";
      return ret;
    },
    tagWrap : function(name, attr, body){
      return this.tagStart(name, attr, false) + body + "</" + name + ">";
    },
    setRadius : function(p1, p2, radius, dst){
      var rpx = radius + "px";
      dst["-moz-border-radius-" + p1 + p2] = rpx;
      dst["-khtml-border-radius-" + p1 + p2] = rpx;
      dst["-webkit-border-" + p1 + "-" + p2 + "-radius"] = rpx;
    }
  };

  // ------------------------------------------------------------------------
  // vertical character mapping
  // ------------------------------------------------------------------------
  var VerticalCharMap = {
    get : function(c1){
      switch(c1){
      case "「": case "｢": 
	return {imgname:"kakko1", hscale:0.5, kind:"img-char"};
      case "」": case "｣": 
	return {imgname:"kakko2", hscale:0.5, kind:"img-char"};
      case "『": 
	return {imgname:"kakko3", hscale:0.5, kind:"img-char"};
      case "』": 
      return {imgname:"kakko4", hscale:0.5, kind:"img-char"};
      case "（": case "(": case "｛": case "{": 
	return {imgname:"kakko5", hscale:0.5, kind:"img-char"};
      case "）": case ")": case "｝": case "}": 
	return {imgname:"kakko6", hscale:0.5, kind:"img-char"};
      case "＜": case "<": case "〈": 
	return {imgname:"kakko7", hscale:0.5, kind:"img-char"};
      case "＞": case ">": case "〉": 
	return {imgname:"kakko8", hscale:0.5, kind:"img-char"};
      case "《": case "≪": 
	return {imgname:"kakko9", hscale:0.5, kind:"img-char"};
      case "》": case "≫": 
      return {imgname:"kakko10", hscale:0.5, kind:"img-char"};
      case "［": case "〔": case "[": 
	return {imgname:"kakko11", hscale:0.5, kind:"img-char"};
      case "］": case "〕": case "]": 
	return {imgname:"kakko12", hscale:0.5, kind:"img-char"};
      case "【": 
	return {imgname:"kakko17", hscale:0.5, kind:"img-char"};
      case "】": 
      return {imgname:"kakko18", hscale:0.5, kind:"img-char"};
      case "：": case ":": 
	return {imgname:"tenten", hscale:0.5, kind:"img-char"};
      case "。": case "｡": 
	return {imgname:"kuten", hscale:0.5, kind:"img-char"};
      case "．": case ".": 
	return {imgname:"period", hscale:1, kind:"img-char"};
      case "、": case "､": case ",": case "，": 
	return {imgname:"touten", hscale:0.5, kind:"img-char"};
      case "～": case "〜": 
	return {imgname:"kara", hscale:1, kind:"img-char"};
      case "…":
      return {imgname:"mmm", hscale:1, kind:"img-char"};
      case "‥":
	return {imgname:"mm", hscale:1, kind:"img-char"};
      case "〝":
	return {imgname:"dmn1", hscale:1, kind:"img-char"};
      case "〟":
	return {imgname:"dmn2", hscale:1, kind:"img-char"};
      case "＝": case "=":
	return {imgname:"equal", hscale:1, kind:"img-char"};
      case "ー":
	return {imgname:"onbiki", hscale:1, kind:"img-char"};
      case "-": case "―": case "－": case "─":
	return {data:"｜", kind:"cnv-char"};
      case "↑":
      return {data:"→", kind:"cnv-char"};
      case "→": case "⇒":
	return {data:"↓", kind:"cnv-char"};
      case "↓":
	return {data:"←", kind:"cnv-char"};
      case "←":
	return {data:"↑", kind:"cnv-char"};
      default:
	return null;
      }
    }
  };

  // ------------------------------------------------------------------------
  // CssMap
  // ------------------------------------------------------------------------
  var CssMap = {
    h1:{scale:3.0, family:"Meiryo", weight:"bold"},
    h2:{scale:2.0, family:"Meiryo", weight:"bold"},
    h3:{scale:1.5, family:"Meiryo"},
    h4:{scale:1.2, family:"Meiryo"},
    h5:{scale:1.0, family:"Meiryo", weight:"bold"}
  };

  // ------------------------------------------------------------------------
  // TextStream
  // ------------------------------------------------------------------------
  function TextStream(text, length, eof){
    this.text = text;
    this.length = length;
    this.eof = eof;
    this.pos = 0;
  }

  TextStream.prototype.lookChar = function(){
    if(this.pos == this.length){
      return "\n";
    }
    if(this.pos > this.length){
      throw "BufferEnd";
    }
    if(this.pos >= this.text.length){
      throw "BufferShort";
    }
    return this.text.charAt(this.pos);
  };

  TextStream.prototype.readUntil = function(dstChar){
    var p1 = this.pos;
    var p2 = this.text.indexOf(dstChar, p1+1);
    if(p2 < 0){
      throw "BufferShort";
    }
    this.pos = p2 + 1;
    return this.text.substring(p1, p2+1);
  };

  TextStream.prototype.readMatch = function(regexp){
    var p1 = this.pos;
    var word = this.text.substring(p1).match(regexp).toString();
    if(word != ""){
      this.pos = p1 + word.length;
    }
    return this.text.substring(p1, p1 + word.length);
  };

  TextStream.prototype.stepSeekPos = function(){
    this.pos++;
  };

  TextStream.prototype.getSeekPos = function(){
    return this.pos;
  };

  TextStream.prototype.setSeekPos = function(pos){
    if(pos < this.length){
      this.pos = pos;
    }
  };

  TextStream.prototype.setText = function(text){
    this.text = text;
    this.length = text.length;
    this.eof = true;
  };

  TextStream.prototype.getText = function(){
    return this.text;
  };

  TextStream.prototype.addText = function(text){
    this.text += text;
    this.eof = this.text.length >= this.length;
  };

  TextStream.prototype.getSeekPercent = function(){
    return Math.floor(100 * this.pos / this.length);
  };

  TextStream.prototype.setEOF = function(isEOF){
    return this.eof = isEOF;
  };

  TextStream.prototype.isEOF = function(){
    return this.eof;
  };

  // ------------------------------------------------------------------------
  // StreamLexer
  // ------------------------------------------------------------------------
  function StreamLexer(stream){
    this.stream = stream;
  }

  StreamLexer.prototype.getStream = function(){
    return this.stream;
  };

  StreamLexer.prototype.tag = function(pos, src){
    var tmp = src.replace("<", "").replace("/>", "").replace(">","").split(/[\s\t　]+/);
    var data = {};
    data.src = src;
    data.name = tmp[0].toLowerCase();
    data.attr = {};
    for(var i = 0; i < tmp.length; i++)(function (v,i){
      if(v.match(/([^=]+)=(.+)/)){
	var name = RegExp.$1;
	var value = Util.cutQuote(RegExp.$2);
	data.attr[name] = value;
      }
    })(tmp[i],i);
    return {type:"tag", data:data, pos:pos};
  };

  StreamLexer.prototype.character = function(pos, c1){
    var c2 = VerticalCharMap.get(c1);
    if(c2){
      c2.type ="char";
      c2.half = false;
      c2.pos = pos;
      if(c2.kind == "img-char"){
	c2.data = c1;
      } else if (c2.kind == "cnv-char"){
	c2.fromdata = c1;
      }
      return c2;
    }
    if(c1.match(/[ぁァぃィぅゥぇェぉォヵヶっッゃャゅュょョゎヮ]/)){
      return {type:"char", half:false, kind:"small-kana", data:c1, pos:pos};
    }
    if(c1.charAt(0) == "&"){
      return {type:"char", half:true, kind:"special-char", data:c1, pos:pos};
    }
    if(escape(c1).charAt(1) == "u"){
      return {type:"char", half:false, kind:"zen", data:c1, pos:pos};
    }
    return {type:"char", half:true, kind:"small", data:c1, pos:pos};
  };

  StreamLexer.prototype.word = function(pos, str){
    return {type:"word", data:str, pos:pos};
  };

  StreamLexer.prototype.tcy = function(pos, str){
    return {type:"tcy", data:str, pos:pos};
  };

  StreamLexer.prototype.getNext = function(){
    var p1 = this.stream.getSeekPos();
    var c1 = this.stream.lookChar();
    if (c1=="<") {
      return this.tag(p1, this.stream.readUntil(">"));
    } else if (c1=="&") {
      return this.character(p1, this.stream.readUntil(";"));
    } else if(Env.canTransform && c1.match(/[0-9a-zA-Z!\.\?\/\_:#]/)){
      var str = this.stream.readMatch(/[0-9a-zA-Z!\.\?\/\_:#]+/);
      if(str.length <= 2 && !isNaN(str) || str == "!?" || str == "!!" || str == "??"){
	return this.tcy(p1, str);
      } else {
	return this.word(p1, str);
      }
    } else {
      this.stream.stepSeekPos();
      return this.character(p1, c1);
    }
  };

  StreamLexer.prototype.lookNextStr = function(){
    var backup = this.stream.getSeekPos();
    var ret = null;
    while(true){
      var token = this.getNext();
      if(token.type == "char" || token.type == "tcy" || token.type == "word"){
	ret = token;
	break;
      }
    }
    this.stream.setSeekPos(backup);
    return ret;
  };

  StreamLexer.prototype.skipUntilTag = function(tagName){
    while(true){
      var token = this.getNext();
      if(token.type == "tag" && token.data.name == tagName){
	break;
      }
    }
  };

  StreamLexer.prototype.skipCRLF = function(skipCount){
    var count = 0;
    while(true){
      var token = this.getNext();
      if(token.type != "char" || (token.type == "char" && token.data != "\r" && token.data != "\n")){
	this.stream.setSeekPos(token.pos);
	break;
      }
      if(token.data == "\n"){
	count++;
      }
      if(skipCount && count >= skipCount){
	break;
      }
    }
  };

  // ------------------------------------------------------------------------
  // Layout
  // ------------------------------------------------------------------------
  function Layout(opt){
    Util.readOption(this, {
      direction: "vertical",
      width: 400,
      height: 300,
      fontSize: 16,
      fontColor: "000000",
      linkColor: "0000FF",
      charImgRoot: "http://nehan.googlecode.com/hg/char-img/",
      //charImgRoot:"/img/char-img/",
      nextLineOffsetRate: 1.8
    }, opt);
    this.init();
  }

  Layout.prototype.init = function(){
    this.direction = this.direction.toLowerCase();
    this.isV = this.direction.match(/vertical/i)?  true : false;
    this.baseNextLineSize = Math.floor(this.nextLineOffsetRate * this.fontSize);
    this.fontSizeHalf = Math.floor(this.fontSize / 2);
    this.baseRubyFontSize = this.fontSizeHalf;
    this.baseExtraLineSize = this.baseNextLineSize - this.fontSize;
    if(this.isV){
      this.invDirection = "horizontal";
      this.extraFontSize = this.fontSizeHalf;
      this.width = Math.max(this.baseNextLineSize, this.width);
      this.height = Math.max(this.fontSize + this.extraFontSize, this.height);
      this.lineEndSize = this.height - this.extraFontSize;
      this.nextCharMaxSize = this.height;
      this.nextLineMaxSize = this.width;
    } else {
      this.invDirection = "vertical";
      this.extraFontSize = this.fontSize;
      this.width = Math.max(this.fontSize + this.extraFontSize, this.width);
      this.height = Math.max(this.baseNextLineSize, this.height);
      this.nextCharMaxSize = this.width - this.extraFontSize;
      this.nextLineMaxSize = this.height;
    }
    this.linkColor = ColorMap.get(this.linkColor);
  };

  Layout.prototype.getIndentCount = function(indent){
    return indent.before + indent.after;
  };

  Layout.prototype.getIndentSize = function(indentCount){
    return this.fontSize * indentCount;
  };

  Layout.prototype.getNextCharMaxSize = function(context){
    var indentCount = this.getIndentCount(context.curIndent);
    var indentSize = this.getIndentSize(indentCount);
    return this.nextCharMaxSize - indentSize;
  };

  Layout.prototype.getAlignSpaceSize = function(insWidth, insHeight){
    return {
      width  : this.isV ? insWidth + this.baseExtraLineSize : this.width - insWidth - this.baseExtraLineSize,
      height : this.isV ? this.height - insHeight - this.baseExtraLineSize : insHeight + this.baseExtraLineSize
    };
  };

  Layout.prototype.isAlignEnable = function(leftWidth, leftHeight){
    return this.isV? (leftHeight * 2 > this.height) : (leftWidth * 2 > this.width);
  };

  // ------------------------------------------------------------------------
  // ParserContext
  // ------------------------------------------------------------------------
  function ParserContext(layout){
    this.lineTokens = [];
    this.nextLineTokens = [];
    this.rubyTokens = [];
    this.nextRubyTokens = [];
    this.activeTags = {};
    this.tagStack = [];
    this.fontStack = [];
    this.indentStack = [];
    this.dotTokens = [];
    this.repushTokenStack = [];
    this.curFontScale = 1;
    this.curFontColor = layout.fontColor;
    this.curFontSize = layout.fontSize;
    this.curFontSizeHalf = layout.fontSizeHalf;
    this.curIndent = {before:0, after:0};
    this.curBorderSize = 0;
    this.curPageNo = 0;
    this.saveSeekPos = 0;
    this.curCharCount = 0;
    this.seekNextLine = 0;
    this.seekNextChar = 0;
    this.pageHtml = "";
    this.pageHeadPos = 0;
  };

  ParserContext.prototype.setActiveTag = function(tagName){
    this.activeTags[tagName.replace("/","")] = tagName.substring(0,1) != "/";
  };

  ParserContext.prototype.isActiveTag = function(tagName){
    return (this.activeTags[tagName] || false);
  };

  ParserContext.prototype.setFontScale = function(layout, scale){
    this.curFontScale = scale;
    this.curFontSize = Math.floor(layout.fontSize * scale);
    this.curFontSizeHalf = Math.floor(this.curFontSize / 2);
  };

  ParserContext.prototype.inheritLine = function(){
    this.lineTokens = this.nextLineTokens;
    this.nextLineTokens = new Array();
    this.rubyTokens = this.nextRubyTokens;
    this.nextRubyTokens = new Array();
  };

  // ------------------------------------------------------------------------
  // StreamParser
  // ------------------------------------------------------------------------
  function StreamParser(lexer, layout){
    this.lexer = lexer;
    this.layout = layout;
    this.context = new ParserContext(layout);
    this.parseEnd = false;
    this.elementHandler = [];
    this.tocTable = [];
  }

  StreamParser.prototype.hasNextPage = function(){
    return (this.parseEnd == false);
  };

  StreamParser.prototype.getLexer = function(){
    return this.lexer;
  };

  StreamParser.prototype.getTocTable = function(){
    return this.tocTable;
  };

  StreamParser.prototype.isHeadNg = function(c1){
    if(c1.match(/[）\)」】〕］\]。』＞〉》、．\.,]/)){
      return true;
    }
    return false;
  };

  StreamParser.prototype.isHeadNgToken = function(token){
    if(token.type != "char"){
      return false;
    }
    return this.isHeadNg(token.data);
  };

  StreamParser.prototype.isTailNg = function(c1){
    if(c1.match(/[（\(「【［〔『＜〈《]/)){
      return true;
    }
    return false;
  };

  StreamParser.prototype.isTailNgToken = function(token){
    if(token.type != "char"){
      return false;
    }
    return this.isTailNg(token.data);
  };

  StreamParser.prototype.isTextToken = function(token){
    return (token.type == "char" || token.type == "word" || token.type == "tcy");
  };

  StreamParser.prototype.isTailConnectiveChar = function(token){
    return (token.type == "char" && token.data.match(/[、。\.．,，」』）]/));
  };

  StreamParser.prototype.isKakkoStartChar = function(c1){
    if(c1.match(/[「『【［（《〈≪＜\[\(]/)){
      return true;
    }
    return false;
  };

  StreamParser.prototype.isKakkoEndChar = function(c1){
    if(c1.match(/[」』】］）》〉≫＞\]\)]/)){
      return true;
    }
    return false;
  };

  StreamParser.prototype.isParserEnd = function(){
    return this.parseEnd;
  };

  StreamParser.prototype.isNextCharOver = function(layout, context, nextToken){
    return (context.seekNextChar + nextToken.nextOffset > layout.getNextCharMaxSize(context));
  };

  StreamParser.prototype.isNextLineOver = function(layout, context, nextLineSize){
    return (context.seekNextLine + nextLineSize > layout.nextLineMaxSize);
  };

  StreamParser.prototype.isLineOverflow = function(layout, context){
    return (context.seekNextChar > layout.getNextCharMaxSize(context));
  };

  StreamParser.prototype.setFont = function(layout, context, attr){
    if(attr.scale){
      this.setFontScale(layout, context, parseFloat(attr.scale));
    }
    if(attr["border-width"]){
      context.curBorderSize = parseInt(attr["border-width"]);
    }
    if(attr.color){
      context.curFontColor = ColorMap.get(attr.color);
    }
  };
  
  StreamParser.prototype.setFontScale = function(layout, context, scale){
    context.setFontScale(layout, scale);
  };

  StreamParser.prototype.resetFont = function(layout, context){
    context.curFontScale = 1;
    context.curFontColor = layout.fontColor;
    context.curFontSize = layout.fontSize;
    context.curFontSizeHalf = layout.baseRubyFontSize;
    context.curBorderSize = 0;
  };

  StreamParser.prototype.popFont = function(layout, context){
    context.tagStack.pop();
    context.fontStack.pop();

    var stackLen = context.fontStack.length;
    if(stackLen > 0){
      this.setFont(layout, context, context.fontStack[stackLen - 1]);
    } else {
      this.resetFont(layout, context);
    }
  };

  StreamParser.prototype.popIndent = function(layout, context){
    var indent = context.indentStack.pop();
    if(indent){
      context.curIndent.before -= indent.before;
      context.curIndent.after -= indent.after;
    }
  };

  StreamParser.prototype.getFontCss = function(layout, context, attr){
    var css = {};
    for(prop in attr){
      if(prop == "scale"){
	var scale = parseFloat(attr["scale"]);
	var scaleFontSize = Math.floor(layout.fontSize * scale);
	css["font-size"] = scaleFontSize + "px";
	if(layout.isV){
	  css["line-height"] = Math.floor(layout.fontSize * scale) + "px";
	}
      } else if (prop == "family"){
	css["font-family"] = attr[prop];
      } else if (prop == "weight"){
	css["font-weight"] = attr[prop];
      } else if (prop == "color"){
	css["color"] = attr[prop];
      } else if (prop == "bgcolor"){
	css["background-color"] = attr[prop];
      } else if (prop == "border-radius-tl"){
	Util.setRadius("top", "left", parseInt(attr[prop]), css);
      } else if (prop == "border-radius-tr"){
	Util.setRadius("top", "right", parseInt(attr[prop]), css);
      } else if (prop == "border-radius-bl"){
	Util.setRadius("bottom", "left", parseInt(attr[prop]), css);
      } else if (prop == "border-radius-br"){
	Util.setRadius("bottom", "right", parseInt(attr[prop]), css);
      } else if (prop == "border-radius"){
	var radius = parseInt(attr[prop]);
	Util.setRadius("top", "left", radius, css);
	Util.setRadius("top", "right", radius, css);
	Util.setRadius("bottom", "left", radius, css);
	Util.setRadius("bottom", "right", radius, css);
      } else if (prop == "border-width"){
	css["border-width"] = parseInt(attr[prop]) + "px";
      } else if (prop == "border-color"){
	css["border-color"] = attr[prop];
      } else if (prop == "border-style"){
	css["border-style"] = attr[prop];
      }
    }
    return css;
  };

  StreamParser.prototype.tagFontStart = function(layout, context, attr){
    return Util.tagStart(layout.isV ? "div" : "span", {
      style:Util.inlineCss(this.getFontCss(layout, context, attr))
    }, false);
  };

  StreamParser.prototype.tagFontEnd = function(layout){
    return layout.isV ? "</div>" : "</span>";
  };

  StreamParser.prototype.getMaxFontScale = function(lineTokens){
    var ret = 1;
    for(var i = 0; i < lineTokens.length; i++){
      var token = lineTokens[i];
      if(token.type == "tag"){
	var tag = token.data;
	if(tag.name == "font" && tag.attr.scale){
	  var scale = parseFloat(tag.attr.scale);
	  if(scale > ret){
	    for(var k = i + 1; k < lineTokens.length; k++){
	      if(this.isTextToken(lineTokens[k])){
		ret = scale;
	      }
	    }
	  }
	}
      }
    }
    return ret;
  };

  StreamParser.prototype.getLineTextLength = function(lineTokens){
    var ret = 0;
    for(var i = 0; i < lineTokens.length; i++){
      var token = lineTokens[i];
      if(this.isTextToken(token)){
	ret += token.nextOffset;
      }
    }
    return ret;
  };

  StreamParser.prototype.getTokenLength = function(token){
    if(token.type == "tag"){
      return token.data.src.length;
    }
    return token.data.length;
  };

  StreamParser.prototype.getLineTailStr = function(context){
    for(var i = context.lineTokens.length - 1; i >= 0; i--){
      var token = context.lineTokens[i];
      if(this.isTextToken(token)){
	return token;
      }
    }
    return null;
  };

  StreamParser.prototype.getRubyToken = function(layout, context, pos, yomi){
    return {
      pos:pos,
      yomi:yomi,
      fontSize:context.curFontSizeHalf,
      nextOffset:context.curFontSizeHalf,
      requireSpaceSize:context.curFontSize
    };
  };

  StreamParser.prototype.getRubyCss = function(layout, context, rubyPos, rubyFontSize, maxScale){
    var css = {
      position:"absolute",
      "font-size":rubyFontSize + "px"
    };
    var scaleOffset = (maxScale > 1)? Math.floor((maxScale - 1) * layout.baseExtraLineSize / 2) : 0;

    if(layout.isV){
      css["margin-top"] = rubyPos + "px";
      css["line-height"] = Env.isMobileSafari? "0.9em" : "1.1em";
      if(maxScale > 1 && rubyFontSize <= layout.baseRubyFontSize){
	css["margin-left"] = "-" + scaleOffset + "px";
	css["float"] = "left";
      }
    } else {
      css["margin-left"] = rubyPos + "px";
      if(maxScale > 1 && rubyFontSize <= layout.baseRubyFontSize){
	css["padding-top"] = (scaleOffset + scaleOffset + scaleOffset) + "px"; // 1.5times for half line difference of orig line height;
      }
    }
    return css;
  };

  StreamParser.prototype.getDotToken = function(layout, context, parentCharPos, count){
    var dotFontRate = layout.nextLineOffsetRate - 1;
    var dotFontSize = Math.floor(context.curFontSize * dotFontRate);
    var offsetHead = Math.floor(context.curFontSize * (1 - dotFontRate) / 2);
    var dotPos = parentCharPos + offsetHead;
    var hspace = context.curFontSize - dotFontSize; // for horizontal only.
    return {
      pos:dotPos,
      count:count,
      fontSize:dotFontSize,
      nextOffset:context.curFontSize,
      requireSpaceSize:context.curFontSize,
      offsetHead:offsetHead,
      hspace:hspace
    };
  };

  StreamParser.prototype.getDotCss = function(layout, context, dot, maxScale){
    if(layout.isV){
      return {
	"position":"absolute",
	"margin-top":dot.pos,
	"font-size":dot.fontSize + "px",
	"line-height":dot.nextOffset + "px",
	"font-weight":"bold"
      };
    } else {
      return {
	"position":"absolute",
	"margin-left":dot.pos,
	"font-size":dot.fontSize,
	"letter-spacing": dot.hspace + "px",
	"font-weight":"bold"
      };
    }
  };

  StreamParser.prototype.getTailCharToken = function(tokens){
    for(var i = tokens.length - 1; i >= 0; i--){
      if(this.isTextToken(tokens[i])){
	return tokens[i];
      }
    }
    return null;
  };

  StreamParser.prototype.isTailNgLine = function(tokens){
    var tail = this.getTailCharToken(tokens);
    if(tail && tail.type == "char"){
      return this.isTailNgToken(tail);
    }
    return false;
  };

  StreamParser.prototype.sweepOverflowTokens = function(layout, context){
    var len = context.lineTokens.length;
    var max = layout.getNextCharMaxSize(context);
    var size = 0;
    for(var i = 0; i < len; i++){
      var token = context.lineTokens[i];
      if(this.isTextToken(token)){
	size += token.nextOffset;
	if(size > max){
	  break;
	}
      }
    }
    if(0 < i && i < len){
      context.nextLineTokens = context.lineTokens.slice(i).concat(context.nextLineTokens);
      context.lineTokens = context.lineTokens.slice(0,i); 
    }
  };
  
  StreamParser.prototype.sweepWhileMatch = function(src, dst, sweepCheck, breakCheck, sweepBreakCheck){
    var modified = false;
    while(src.length > 0){
      var t = src.pop();
      if(sweepCheck(t)){
	dst.push(t);
	modified = true;
      } else if(sweepBreakCheck(t)){
	dst.push(t);
	modified = true;
	break;
      } else if(breakCheck(t)){
	src.push(t);
	break;
      }
    }
    return modified;
  };

  StreamParser.prototype.fixLineEnd = function(layout, lineTokens, nextLineTokens){
    var self = this;
    var tail = this.getTailCharToken(lineTokens);
    if(tail && this.isTailNgToken(tail)){
      if(this.sweepWhileMatch(lineTokens, nextLineTokens, function(t){
	return self.isTailNgToken(t);
      }, function(t){
	return !self.isTailNgToken(t);
      }, function(t){
	return false;
      })){
	nextLineTokens.sort(function(t1, t2){ return (t1.pos - t2.pos); });
      }
    }
    var head = nextLineTokens[0];
    if(this.isHeadNgToken(head)){
      if(this.sweepWhileMatch(lineTokens, nextLineTokens, function(t){
	return false;
      }, function(t){
	return false;
      }, function(t){
	return !self.isHeadNgToken(t);
      })){
	nextLineTokens.sort(function(t1, t2){ return (t1.pos - t2.pos); });
      }
    }
  };

  // ------------------------------------------------------------------------
  // parse
  // ------------------------------------------------------------------------
  StreamParser.prototype.parseTag = function(lexer, layout, context, token, inline){
    var tag = token.data;
    context.setActiveTag(tag.name);
    if(this.elementHandler[tag.name]){
      (this.elementHandler[tag.name])(this, lexer, layout, context, token);
    } else if(tag.name == "a"){
      this.parseStraightForwardTagStart(lexer, layout, context, token);
    } else if (tag.name == "/a"){
      this.parseStraightForwardTagEnd(lexer, layout, context, token);
    } else if (tag.name == "b" || tag.name == "strong"){
      this.parseStraightForwardTagStart(lexer, layout, context, token);
    } else if (tag.name == "/b" || tag.name == "/strong"){
      this.parseStraightForwardTagEnd(lexer, layout, context, token);
    } else if (tag.name == "ruby"){
      this.parseRuby(lexer, layout, context, token);
    } else if (tag.name == "rt"){
      lexer.skipUntilTag("/rt"); // this is read already by parseRuby, so skip it.
    } else if (tag.name == "rp"){
      lexer.skipUntilTag("/rp"); // this is read already by parseRuby, so skip it.
    } else if (tag.name == "font"){
      this.parseFontStart(lexer, layout, context, token);
    } else if (tag.name == "/font"){
      this.parseFontEnd(lexer, layout, context, token);
    } else if (tag.name == "img"){
      this.parseImg(lexer, layout, context, token);
    } else if (tag.name == "end-page"){
      this.parseEndPage(lexer, layout, context, token, inline);
    } else if (tag.name == "dot"){
      this.parseDot(lexer, layout, context, token);
    } else if (tag.name == "indent"){
      this.parseIndentStart(lexer, layout, context, token);
    } else if (tag.name == "/indent"){
      this.parseIndentEnd(lexer, layout, context, token);
    } else if (tag.name == "toc"){
      this.parseToc(lexer, layout, context, token);
    } else if (tag.name == "pack"){
      this.parsePack(lexer, layout, context, token);
    } else if (tag.name == "h1" || tag.name == "h2" || tag.name == "h3" || tag.name == "h4" || tag.name == "h5"){
      this.parseHeaderStart(lexer, layout, context, token);
    } else if (tag.name == "/h1" || tag.name == "/h2" || tag.name == "/h3" || tag.name == "/h4" || tag.name == "/h5"){
      this.parseHeaderEnd(lexer, layout, context, token);
    } else if (tag.name == "blockquote"){
      this.parseBlockquoteStart(lexer, layout, context, token);
    } else if (tag.name == "/blockquote"){
      this.parseBlockquoteEnd(lexer, layout, context, token);
    } else if (tag.name == "layout"){
      this.parseInlineLayoutStart(lexer, layout, context, token);
    } else if (tag.name == "/layout"){
      this.parseInlineLayoutEnd(lexer, layout, context, token);
    }
  };

  StreamParser.prototype.parseInlineLayoutStart = function(lexer, layout, context, token){
    if(this.getLineTextLength(context.lineTokens) > 0){
      lexer.skipCRLF();
      this.pushLine(lexer, layout, context, false);
    }
    this.setMetricsLayout(lexer, layout, context, token);
    this.pushInlineLayout(lexer, layout, context, token);
  };
  
  StreamParser.prototype.parseInlineLayoutEnd = function(lexer, layout, context, token){
    lexer.skipCRLF();
    this.pushLine(lexer, layout, context, token, false);
    throw "PageEnd";
  };

  StreamParser.prototype.parseStraightForwardTagStart = function(lexer, layout, context, token){
    context.lineTokens.push(token);
    context.tagStack.push(token);
  };

  StreamParser.prototype.parseStraightForwardTagEnd = function(lexer, layout, context, token){
    context.lineTokens.push(token);
    context.tagStack.pop();
  };

  StreamParser.prototype.parseIndentStart = function(lexer, layout, context, token){
    var attr = token.data.attr;
    var before = (attr.before)? parseInt(attr.before) : 0;
    var after = (attr.after)? parseInt(attr.after) : 0;
    var count = (attr.count)? parseInt(attr.count) : 0;
    if(count > 0){
      before = after = count;
    }
    if(before > 0 || after > 0){
      var indent = {before:before, after:after};
      context.indentStack.push(indent);
      context.curIndent.before += before;
      context.curIndent.after += after;
    }
  };

  StreamParser.prototype.parseIndentEnd = function(lexer, layout, context, token){
    lexer.skipCRLF();
    try {
      this.pushLine(lexer, layout, context, false);
    } finally {
      this.popIndent(layout, context);
    }
  };

  StreamParser.prototype.parseFontStart = function(lexer, layout, context, token){
    context.lineTokens.push(token);
    context.tagStack.push(token);
    context.fontStack.push(token.data.attr);

    this.setFont(layout, context, token.data.attr);
  };

  StreamParser.prototype.parseFontEnd = function(lexer, layout, context, token){
    context.lineTokens.push(token);
    this.popFont(layout, context);
  };

  StreamParser.prototype.parseEndPage = function(lexer, layout, context, token, inline){
    if(inline){
      lexer.getStream().setSeekPos(token.pos);
    } else {
      lexer.skipCRLF();
      this.pushLine(lexer, layout, context, token, false);
    }
    throw "PageEnd";
  };

  StreamParser.prototype.parseHeaderStart = function(lexer, layout, context, token){
    this.parseFontStart(lexer, layout, context, {type:"tag", data:{name:"font", attr:CssMap[token.data.name]}, pos:-1});
  };

  StreamParser.prototype.parseHeaderEnd = function(lexer, layout, context, token){
    var scale = CssMap[token.data.name.replace("/", "")].scale;
    var margin = Math.floor(layout.baseExtraLineSize * scale);
    this.parseFontEnd(lexer, layout, context, {type:"tag", data:{name:"/font", attr:{}}, pos:-1});
    this.pushLine(lexer, layout, context, false);
    lexer.skipCRLF();
    this.pushSpaceLine(lexer, layout, context, margin);
  };

  StreamParser.prototype.parseBlockquoteStart = function(lexer, layout, context, token){
    lexer.skipCRLF();
    this.parseIndentStart(lexer, layout, context, {type:"tag", data:{name:"indent", attr:{count:2}}, pos:-1});
    this.parseFontStart(lexer, layout, context, {type:"tag", data:{name:"font", attr:{scale:0.8}}, pos:-1});
  };
  
  StreamParser.prototype.parseBlockquoteEnd = function(lexer, layout, context, token){
    this.parseIndentEnd(lexer, layout, context, {type:"tag", data:{name:"/indent"}, pos:-1});
    this.parseFontEnd(lexer, layout, context, {type:"tag", data:{name:"/font"}, pos:-1});
    lexer.skipCRLF();
    this.pushLine(lexer, layout, context, false);
  };

  StreamParser.prototype.parseRuby = function(lexer, layout, context, token){
    var yomi = "";
    var curTagName = "ruby";
    var rubyPos = context.seekNextChar;
    var rubyOff = 0;
    var restartPos = token.pos + this.getTokenLength(token);
    var nextCharMax = layout.getNextCharMaxSize(context);

    while(true){
      var token2 = lexer.getNext();
      if(token2.type == "tag"){
	var curTagName = token2.data.name;
	if(curTagName == "/ruby"){
	  lexer.getStream().setSeekPos(restartPos);
	  break;
	} else if(curTagName == "rb"){
	  restartPos = token2.pos + this.getTokenLength(token2);
	} else if (curTagName == "/rt"){
	  if(rubyPos + context.curFontSize >= nextCharMax){
	    rubyPos = 0;
	    context.nextRubyTokens.push(this.getRubyToken(layout, context, rubyPos, yomi));
	  } else {
	    context.rubyTokens.push(this.getRubyToken(layout, context, rubyPos, yomi));
	    rubyPos += rubyOff;
	  }
	  yomi = "";
	}
      } else if (this.isTextToken(token2) && token2.kind != "img-char"){
	if(curTagName == "rt"){
	  yomi += token2.data;
	} else if (curTagName != "rp"){
	  this.setMetricsStr(lexer, layout, context, token2);
	  rubyOff += token2.nextOffset;
	}
      }
    }
  };

  StreamParser.prototype.parseDot = function(lexer, layout, context, token){
    var dotPos = context.seekNextChar;
    var restartPos = -1;
    var dotCount = 0;

    while(true){
      var token = lexer.getNext();
      if(token.type == "tag" && token.data.name == "/dot" && dotCount > 0){
	context.dotTokens.push(this.getDotToken(layout, context, dotPos, dotCount));
	if(restartPos >= 0){
	  lexer.getStream().setSeekPos(restartPos);
	}
	break;
      } else if (token.type == "char"){
	if(restartPos < 0){
	  restartPos = token.pos;
	}
	dotCount++;
      }
    }
  };

  StreamParser.prototype.parseToc = function(lexer, layout, context, token){
    var title = "";
    var restartPos = lexer.getStream().getSeekPos();
    while(true){
      var t = lexer.getNext();
      if(t.type == "tag" && t.data.name == "/toc"){
	this.tocTable.push({title:title, pageNo:context.curPageNo});
	lexer.getStream().setSeekPos(restartPos);
	break;
      } else {
	if(this.isTextToken(t)){
	  title += t.data;
	}
      }
    }
  };

  StreamParser.prototype.parsePack = function(lexer, layout, context, token){
    var tcy = "";
    var restartPos = lexer.getStream().getSeekPos();
    while(true){
      var t = lexer.getNext();
      if(t.type == "tag" && t.data.name == "/pack"){
	if(tcy != ""){
	  this.parseTcy(lexer, layout, context, lexer.tcy(token.pos, tcy));
	}
	break;
      } else {
	if(this.isTextToken(t)){
	  tcy += t.data;
	}
      }
    }
  };

  StreamParser.prototype.parseChar = function(lexer, layout, context, token){
    if(token.data == "\r"){
      return;
    } else if (token.data == "\n"){
      this.pushLine(lexer, layout, context, false);
    } else {
      this.setMetricsChar(lexer, layout, context, token);
      this.pushChar(lexer, layout, context, token);
    }
  };

  StreamParser.prototype.parseWord = function(lexer, layout, context, token){
    this.setMetricsWord(lexer, layout, context, token);
    this.pushWord(lexer, layout, context, token);
  };

  StreamParser.prototype.parseTcy = function(lexer, layout, context, token){
    if(layout.isV){
      this.setMetricsTcy(lexer, layout, context, token);
      this.pushTcy(lexer, layout, context, token);
    } else {
      token.type = "word";
      this.parseWord(lexer, layout, context, token);
    }
  };

  StreamParser.prototype.parseImg = function(lexer, layout, context, token){
    if(this.getLineTextLength(this.context.lineTokens) > 0){
      this.pushLine(lexer, layout, context, false);
    }
    this.setMetricsImg(lexer, layout, context, token);
    this.pushImg(lexer, layout, context, token);
  };

  // ------------------------------------------------------------------------
  // metrics
  // ------------------------------------------------------------------------
  StreamParser.prototype.setMetricsStr = function(lexer, layout, context, token){
    var curChar = token.data;
    if(token.type == "char"){
      this.setMetricsChar(lexer, layout, context, token);
    } else if (token.type == "word"){
      this.setMetricsWord(lexer, layout, context, token);
    } else if (token.type == "tcy"){
      this.setMetricsTcy(lexer, layout, context, token);
    }
  };

  StreamParser.prototype.setMetricsChar = function(lexer, layout, context, token){
    if(token.kind == "small-kana"){
      this.setMetricsSmallKana(lexer, layout, context, token);
    } else if (token.kind == "img-char"){
      this.setMetricsImgChar(lexer, layout, context, token);
    } else if (token.half){
      this.setMetricsHalfChar(lexer, layout, context, token);
    } else {
      this.setMetricsFullChar(lexer, layout, context, token);
    }
  };

  StreamParser.prototype.setMetricsSmallKana = function(lexer, layout, context, token){
    token.nextOffset = context.curFontSize;
    token.fontSize = context.curFontSize;
  };

  StreamParser.prototype.setMetricsImgChar = function(lexer, layout, context, token){
    var curChar = token.data;
    var curImgName = token.imgname;

    token.height = token.nextOffset = (token.hscale == 1)? context.curFontSize :
      (token.hscale == 0.5)? context.curFontSizeHalf : Math.floor(context.curFontSize * token.hscale);
    token.fontSize = context.curFontSize;
    token.color = context.isActiveTag("a")? layout.linkColor : context.curFontColor;

    if(this.isKakkoStartChar(curChar)){
      var prevToken = this.getLineTailStr(context);
      if(prevToken && !this.isKakkoStartChar(prevToken.data)){
	token.nextOffset += context.curFontSizeHalf;
	token.marginTop = context.curFontSizeHalf;
      }
    } else if(this.isKakkoEndChar(curChar)){
      var nextToken = lexer.lookNextStr();
      if(nextToken){
	var nextChar = nextToken.data;
	var nextImgName = nextToken.imgname;
	if(!this.isKakkoEndChar(nextChar) && nextImgName != "tenten" && nextImgName != "kuten" &&
	   nextImgName != "touten" && nextChar != "・"){
	  token.nextOffset = context.curFontSize;
	}
      }
    } else if (curImgName == "kuten" || curImgName == "touten"){
      var nextToken = lexer.lookNextStr();
      if(nextToken){
	var nextChar = nextToken.data;
	if(!this.isKakkoEndChar(nextChar)){
	  token.nextOffset = context.curFontSize;
	}
      }
    }
  };

  StreamParser.prototype.setMetricsHalfChar = function(lexer, layout, context, token){
    token.nextOffset = (Env.canTransform || !layout.isV)? context.curFontSizeHalf : context.curFontSize;
    token.fontSize = context.curFontSize;
  };

  StreamParser.prototype.setMetricsFullChar = function(lexer, layout, context, token){
    token.nextOffset = context.curFontSize;
    token.fontSize = context.curFontSize;
  };

  StreamParser.prototype.setMetricsTcy = function(lexer, layout, context, token){
    token.fontSize = context.curFontSize;
    token.nextOffset = context.curFontSize;
  };

  StreamParser.prototype.setMetricsWord = function(lexer, layout, context, token){
    token.fontSize = context.curFontSize;
    token.fontWidth = context.curFontSizeHalf;
    token.nextOffset = token.data.length * context.curFontSizeHalf;
  };

  StreamParser.prototype.setMetricsImg = function(lexer, layout, context, token){
    var attr = token.data.attr;
    var width = parseInt(attr.width);
    var height = parseInt(attr.height);

    if(width > layout.width){
      var width2 = layout.width - layout.fontSize;
      var height2 = Math.floor(height * (width2 / width));
      width = width2;
      height = height2;
    }
    if(height > layout.height){
      var height2 = layout.height - layout.fontSize;
      var width2 = Math.floor(width * (height2 / height));
      width = width2;
      height = height2;
    }
    token.width = width;
    token.height = height;
    token.nextOffset = (layout.isV? width : height) + layout.baseExtraLineSize;
  };

  StreamParser.prototype.setMetricsLayout = function(lexer, layout, context, token){
    var attr = token.data.attr;
    token.width = parseInt(attr.width);
    token.height = parseInt(attr.height);
    token.nextOffset = layout.isV? token.width : token.height;
  };

  // ------------------------------------------------------------------------
  // push
  // ------------------------------------------------------------------------
  StreamParser.prototype.pushLine = function(lexer, layout, context, overflowLine){
    var maxScale = this.getMaxFontScale(context.lineTokens);
    var borderSize = context.curBorderSize + context.curBorderSize;
    var lineHeight = Math.floor(layout.baseNextLineSize * maxScale);
    lineHeight += borderSize;
    if(this.isNextLineOver(layout, context, lineHeight)){
      if(!overflowLine){
	context.repushTokenStack.push({type:"char", half:true, kind:"small", data:"\n", pos:-1});
      }
      throw "PageEnd";
    }
    var textHeight = Math.floor(layout.fontSize * maxScale) + borderSize;
    var extraHeight = lineHeight - textHeight;
    var mainText = this.makeMainText(layout, context, maxScale);
    var rubyText = this.makeRubyText(lexer, layout, context, maxScale);
    var dotText = this.makeDotText(layout, context, maxScale);
    var extraText = rubyText + dotText;

    context.pageHtml += this.makeExtraLine(layout, context, extraText, extraHeight);
    context.pageHtml += this.makeTextLine(layout, context, mainText, textHeight);
    context.pageHeadPos = lexer.getStream().getSeekPos();
    context.seekNextLine += lineHeight;
    context.seekNextChar = this.getLineTextLength(context.nextLineTokens);
    context.inheritLine();
  };

  StreamParser.prototype.pushSpaceLine = function(lexer, layout, context, lineHeight){
    if(this.isNextLineOver(layout, context, lineHeight)){
      return;
    }
    if(context.seekNextLine == 0){
      return;
    }
    if(context.seekNextChar != 0){
      return;
    }
    context.pageHtml += this.makeTextLine(layout, context, "&nbsp;", lineHeight);
    context.seekNextLine += lineHeight;
    context.pageHeadPos = lexer.getStream().getSeekPos();
  };

  StreamParser.prototype.pushChar = function(lexer, layout, context, token){
    context.curCharCount++;
    if(this.isNextCharOver(layout, context, token)){
      if(this.isLineOverflow(layout, context)){
	this.sweepOverflowTokens(layout, context);
      }
      if(this.isTailConnectiveChar(token) && context.nextLineTokens.length == 0){
	token.fontSize = layout.fontSize;
	token.height = layout.fontSizeHalf;
	context.lineTokens.push(token);
	lexer.skipCRLF(1);
	this.pushLine(lexer, layout, context, true);
      } else {
	context.nextLineTokens.push(token);
	this.fixLineEnd(layout, context.lineTokens, context.nextLineTokens);
	this.pushLine(lexer, layout, context, true);
      }
    } else {
      context.lineTokens.push(token);
      context.seekNextChar += token.nextOffset;
    }
  };

  StreamParser.prototype.pushWord = function(lexer, layout, context, token){
    context.curCharCount += token.data.length;
    var lineMax = layout.getNextCharMaxSize(context);
    var spaceSize = lineMax - context.seekNextChar;
    if(spaceSize < token.nextOffset){
      if(token.nextOffset > lineMax && spaceSize > token.fontWidth){
	token.data = token.data.substring(0, Math.floor(spaceSize / token.fontWidth));
	token.nextOffset = spaceSize;
	context.lineTokens.push(token);
	this.pushLine(lexer, layout, context, true);
	lexer.getStream().setSeekPos(token.pos + token.data.length);
      } else {
	context.nextLineTokens.push(token);
	this.pushLine(lexer, layout, context, true);
      }
    } else {
      context.lineTokens.push(token);
      context.seekNextChar += token.nextOffset;
    }
  };

  StreamParser.prototype.pushTcy = function(lexer, layout, context, token){
    context.curCharCount++;
    if(layout.height - context.seekNextChar < token.nextOffset){
      context.nextLineTokens.push(token);
      this.pushLine(lexer, layout, context, true);
    } else {
      context.lineTokens.push(token);
      context.seekNextChar += token.nextOffset;
    }
  };

  StreamParser.prototype.pushImg = function(lexer, layout, context, token){
    var spaceSize = layout.nextLineMaxSize - context.seekNextLine;
    var tag = token.data;
    if(spaceSize < token.nextOffset){
      lexer.getStream().setSeekPos(token.pos);
      throw "PageEnd";
    }
    lexer.skipCRLF(); // skip flowing CRLF if exists.
    context.seekNextLine += token.nextOffset;
    context.pageHtml += this.makeImgText(lexer, layout, context, token);
    context.pageHeadPos = lexer.getStream().getSeekPos();
  };

  StreamParser.prototype.pushInlineLayout = function(lexer, layout, context, token){
    if(token.width > layout.width || token.height > layout.height){
      return;
    }
    if(this.isNextLineOver(layout, context, token.nextOffset)){
      throw "PageEnd";
    }
    context.seekNextLine += token.nextOffset;
    context.pageHtml += this.makeInlineLayoutText(lexer, layout, context, token);
    context.pageHeadPos = lexer.getStream().getSeekPos();
  };

  // ------------------------------------------------------------------------
  // make
  // ------------------------------------------------------------------------
  StreamParser.prototype.makeTokenText = function(layout, context, token, maxScale){
    if(token.type == "tag"){
      var tag = token.data;
      if(tag.name == "font"){
	return this.tagFontStart(layout, context, tag.attr);
      }
      if(tag.name == "/font"){
	return this.tagFontEnd(layout);
      }
      if(tag.name == "indent" || tag.name == "/indent"){
	return "";
      }
      return Util.tagStart(tag.name, tag.attr, false);
    }
    if(!layout.isV){
      if(token.type == "char" && token.kind == "cnv-char"){
	return token.fromdata;
      }
      return token.data;
    }
    if(token.type == "word"){
      return this.makeWordText(layout, context, token, maxScale);
    }
    if(token.type == "tcy"){
      return this.makeTcyText(layout, context, token);
    }
    return this.makeCharText(layout, context, token);
  };

  StreamParser.prototype.makeCharText = function(layout, context, token){
    if(!layout.isV){
      return token.data;
    }
    if(token.kind == "small-kana"){
      return this.makeSmallKanaText(layout, context, token);
    } else if (token.kind == "img-char"){
      return this.makeImgCharText(layout, context, token);
    } else if (token.half){
      return this.makeHalfCharText(layout, context, token);
    } else {
      return this.makeFullCharText(layout, context, token);
    }
  };

  StreamParser.prototype.makeFullCharText = function(layout, context, token){
    return token.data + "<br />";
  };

  StreamParser.prototype.makeImgCharText = function(layout, context, token){
    var img = Util.tagStart("img", {
      src: Util.filenameConcat(layout.charImgRoot, token.imgname + "/" + token.color + ".png"),
      width: token.fontSize,
      height: token.height,
      style: token.marginTop? "margin-top:" + token.marginTop + "px" : ""
    }, true);

    return Util.tagWrap("div", {
      "class":"img-char",
      style:Util.inlineCss({
	"clear":"both",
	"line-height":token.nextOffset + "px",
	"height": token.nextOffset + "px"
      })
    }, img);
  };

  StreamParser.prototype.makeSmallKanaText = function(layout, context, token){
    return Util.tagWrap("div", {
      "style":Util.inlineCss({
	overflow:"visible",
	position:"relative",
	top:Env.isMobileSafari? "-0.22em" : "-0.12em",
	right:"-0.12em",
	height:token.nextOffset + "px",
	"line-height":token.nextOffset + "px"
      })
    }, token.data);
  };

  StreamParser.prototype.makeHalfCharText = function(layout, context, token){
    return Util.tagWrap("div", {
      "style":Util.inlineCss({
	height:token.nextOffset + "px",
	"line-height": token.nextOffset + "px"
      })
    }, token.data);
  };

  StreamParser.prototype.makeWordText = function(layout, context, token, maxScale){
    var mb = (token.data.length <= 2)? 0 : token.nextOffset - token.fontSize;
    var maxFontSize = (maxScale > 1)? layout.fontSize * maxScale : layout.fontSize;
    if(token.data.length > 2 && maxScale > 1){
      mb = token.nextOffset - maxFontSize;
    }
    if(Env.isIE){
      return Util.tagWrap("div", {
	style : Util.inlineCss({
	  "line-height" : maxFontSize + "px",
	  "writing-mode" : "tb-rl"
	})
      }, token.data);
    } else {
      return Util.tagWrap("div", {
	style : Util.inlineCss({
	  "width": maxFontSize + "px",
	  "height": Math.floor(token.data.length * token.fontSize / 2) + "px",
	  "overflow":"visible"
	})
      }, Util.tagWrap("div", {
	style : Util.inlineCss({
	  "width" : maxFontSize + "px",
	  "line-height" : maxFontSize + "px",
	  "margin-bottom" : mb + "px",
	  "-webkit-transform" : "rotate(90deg)",
	  "-webkit-transform-origin" : "50% 50%",
	  "-moz-transform" : "rotate(90deg)",
	  "-moz-transform-origin" : "50% 50%",
	  "-o-transform" : "rotate(90deg)",
	  "-o-transform-origin" : "50% 50%"
	})
      }, token.data));
    }
  };

  StreamParser.prototype.makeTcyText = function(layout, context, token){
    return token.data + "<br />";
  };

  StreamParser.prototype.makeImgAlignText = function(lexer, layout, context, token, alignSpaceSize){
    var imgAlign = token.data.attr.align;
    var isImgFirst = (imgAlign == "top" || imgAlign == "left");
    var imgAttr = {src:token.data.attr.src, width:token.width, height:token.height};
    var mpx = layout.baseExtraLineSize + "px";

    if(layout.isV){
      var imgCss = isImgFirst ? {"margin" : [0, mpx, mpx, 0].join(" ")} : {"margin" : [mpx, mpx, 0, 0].join(" ")};
    } else {
      var imgCss = isImgFirst ? {"margin" : [mpx, mpx, 0, 0].join(" ")} : {"margin" : [mpx, 0, 0, mpx].join(" ")};
      imgCss["float"] = "left";
    }
    imgAttr["style"] = Util.inlineCss(imgCss);
    var imgHtml = "";
    imgHtml += this.makeLineTokensText(layout, context, 1);
    imgHtml += Util.tagStart("img", imgAttr, true);
    imgHtml += this.makeTagStackCloseText(layout, context);
    context.inheritLine();
    var inlinePage = this.makeInlinePageText(lexer, layout, context, alignSpaceSize.width, alignSpaceSize.height);
    if(!layout.isV){
      inlinePage = Util.tagWrap("div", {style:"float:left"}, inlinePage);
    }
    var mixHtml = isImgFirst ? imgHtml + inlinePage : inlinePage + imgHtml;
    var wrapCss = layout.isV ? {"float":"right"} : {"width":layout.width + "px", "height":token.nextOffset + "px"};
    return Util.tagWrap("div", {style: Util.inlineCss(wrapCss)}, mixHtml);
  };

  StreamParser.prototype.makeImgLineText = function(lexer, layout, context, token){
    var ret = "";
    var css = layout.isV ? {"margin-right": layout.baseExtraLineSize + "px", "float": "right"} :
    {"margin-bottom": layout.baseExtraLineSize + "px"};
    var imgHtml = Util.tagStart("img", {
      src:token.data.attr.src,
      width:token.width,
      height:token.height,
      style:Util.inlineCss(css)
    }, true);
    ret += this.makeLineTokensText(layout, context, 1);
    ret += imgHtml;
    ret += this.makeTagStackCloseText(layout, context);
    context.inheritLine();
    return ret;
  };
  
  StreamParser.prototype.makeImgText = function(lexer, layout, context, token){
    if(token.data.attr.align){
      var alignSpaceSize = layout.getAlignSpaceSize(token.width, token.height);
      if(layout.isAlignEnable(alignSpaceSize.width, alignSpaceSize.height)){
	return this.makeImgAlignText(lexer, layout, context, token, alignSpaceSize);
      } else {
	return this.makeImgLineText(lexer, layout, context, token);
      }
    } else {
      return this.makeImgLineText(lexer, layout, context, token);
    }
  };
  
  StreamParser.prototype.makeInlineLayoutText = function(lexer, layout, context, token){
    var attr = token.data.attr;
    var dir = layout.direction;
    layout.direction = attr.direction || layout.invDirection;
    layout.init();
    var layoutPage1 = this.makeInlinePageText(lexer, layout, context, token.width, token.height);
    context.lineTokens = [];
    context.nextLineTokens = [];
    layout.direction = dir;
    layout.init();

    if(attr.align){
      var p1First = (attr.align == "top" || attr.align == "left");
      var p2Width = layout.isV? token.width : layout.width - token.width;
      var p2Height = layout.isV? layout.height - token.height : token.height;
      var layoutPage2 = this.makeInlinePageText(lexer, layout, context, p2Width, p2Height);
      if(layout.isV){
	var mixPage = p1First? layoutPage1 + layoutPage2 : layoutPage2 + layoutPage1;
	return Util.tagWrap("div", {style:"float:right"}, mixPage);
      } else {
	var layoutPage1Float = Util.tagWrap("div", {style:"float:left"}, layoutPage1);
	var layoutPage2Float = Util.tagWrap("div", {style:"float:left"}, layoutPage2);
	var mixPage = p1First? layoutPage1Float + layoutPage2Float : layoutPage2Float + layoutPage1Float;
	return Util.tagWrap("div", {}, mixPage) + "<div style='clear:both; line-height:0;'></div>";
      }
    } else {
      return tagWrap("div", {style:"float:" + (layout.isV? "right" : "left")}, layoutPage1);
    }
  };

  StreamParser.prototype.makeTextLine = function(layout, context, body, lineSize){
    if(layout.isV){
      return Util.tagWrap("div", {
	"class":"nehan-vertical-text-line",
	style:Util.inlineCss({
	  "float":"right",
	  "text-align":"center",
	  "line-height":Env.isMobileSafari? "0.9em" : layout.fontSize + "px",
	  width:lineSize + "px",
	  height:layout.height + "px"
	})
      }, body);
    } else {
      return Util.tagWrap("div", {
	"class":"nehan-horizontal-text-line",
	style:Util.inlineCss({
	  width:layout.width + "px",
	  height:lineSize + "px",
	  "text-align":"left",
	  "line-height":lineSize + "px"
	})
      }, body);
    }
  };

  StreamParser.prototype.makeExtraLine = function(layout, context, body, lineSize){
    if(layout.isV){
      var body = (body == "")? "&nbsp;" : body;
      return Util.tagWrap("div", {
	"class":"nehan-vertical-extra-line",
	style:Util.inlineCss({
	  "float":"right",
	  "text-align":"left",
	  width:lineSize + "px",
	  height:layout.height + "px",
	  "line-height":Env.isMobileSafari? "0.9em" : "1em"
	})
      }, body);
    } else {
      return Util.tagWrap("div", {
	"class": "nehan-horizontal-extra-line",
	style:Util.inlineCss({
	  width:layout.width + "px",
	  height:lineSize + "px",
	  "line-height":lineSize + "px"
	})
      }, body);
    }
  };

  StreamParser.prototype.makeLineTokensText = function(layout, context, maxScale){
    var ret = "";
    for(var i = 0; i < context.lineTokens.length; i++){
      ret += this.makeTokenText(layout, context, context.lineTokens[i], maxScale);
    }
    return ret;
  };

  StreamParser.prototype.makeMainText = function(layout, context, maxScale){
    var ret = this.makeLineTokensText(layout, context, maxScale);
    ret = this.makeIndentStackWrapText(layout, context, ret);
    ret += this.makeTagStackCloseText(layout, context, ret);
    return ret;
  };

  StreamParser.prototype.makeIndentStackWrapText = function(layout, context, body){
    var ret = "";
    for(var i = 0; i < context.curIndent.before; i++){
      ret += this.makeTokenText(layout, context, {type:"char", half:false, kind:"zen", data:"　"}, 1);
    }
    ret += body;
    for(var i = 0; i < context.curIndent.after; i++){
      ret += this.makeTokenText(layout, context, {type:"char", half:false, kind:"zen", data:"　"}, 1);
    }
    return ret;
  };

  StreamParser.prototype.makeTagStackCloseText = function(layout, context){
    var ret = "";
    for(var i = context.tagStack.length - 1; i >= 0; i--){
      var token = context.tagStack[i];
      ret += this.makeTagCloseText(layout, token);
      context.nextLineTokens.unshift(token);
    }
    return ret;
  };

  StreamParser.prototype.makeTagCloseText = function(layout, token){
    if(token.data.name == "font"){
      return this.tagFontEnd(layout);
    }
    return "</" + token.data.name + ">";
  };

  StreamParser.prototype.makeDotText = function(layout, context, maxScale){
    var ret = "";
    var retryTokens = [];
    var lineMax = layout.getNextCharMaxSize(context);

    for(var i = 0; i < context.dotTokens.length; i++){
      var dot = context.dotTokens[i];
      var dotPos = dot.pos;
      var dotText = "";

      while(dot.count > 0){
	if(lineMax - dotPos < dot.requireSpaceSize){
	  var dot2 = Util.deepCopy(dot);
	  dot2.pos = dot.offsetHead;
	  retryTokens.push(dot2);
	  break;
	}
	dotText += this.makeCharText(layout, context, {
	  type:"char", half:false, kind:"zen", data:"・", fontSize:dot.fontSize
	});
	dotPos += dot.nextOffset;
	dot.count--;
      }

      if(dotText != ""){
	var css = this.getDotCss(layout, context, dot, maxScale);
	ret += Util.tagWrap("span", {style:Util.inlineCss(css)}, dotText);
      }
    }

    context.dotTokens = retryTokens;
    return ret;
  };

  StreamParser.prototype.makeRubyText = function(lexer, layout, context, maxScale){
    var ret = "";
    var indentBefore = layout.getIndentSize(context.curIndent.before);
    var indentAfter = layout.getIndentSize(context.curIndent.after);
    var rubyMaxPos = layout.getNextCharMaxSize(context) + indentBefore;

    for(var i = 0; i < context.rubyTokens.length; i++){
      var ruby = context.rubyTokens[i];

      var curRubyPos = ruby.pos + indentBefore;
      var rubyText = "";

      for(var k = 0; k < ruby.yomi.length; k++){
	c1 = ruby.yomi.charAt(k);
	// sometimes not beautiful.
	if(rubyMaxPos - curRubyPos < ruby.requireSpaceSize){
	  var ruby2 = Util.deepCopy(ruby);
	  ruby2.pos = 0;
	  ruby2.yomi = ruby.yomi.substring(k);
	  context.nextRubyTokens.push(ruby2);
	  break;
	}
	rubyText += this.makeCharText(layout, context, {
	  type:"char", half:false, kind:"zen", data:c1, fontSize:ruby.fontSize
	});
	curRubyPos += ruby.nextOffset;
      }

      if(rubyText != ""){
	var css = this.getRubyCss(layout, context, ruby.pos + indentBefore, ruby.fontSize, maxScale);
	ret += Util.tagWrap("span", {style:Util.inlineCss(css)}, rubyText);
      }
    }
    return ret;
  };

  StreamParser.prototype.makeInlinePageText = function(lexer, layout, context, width, height){
    var backupWidth = layout.width;
    var backupHeight = layout.height;
    var backupSeekNextLine = context.seekNextLine;
    var backupHtml = context.pageHtml;

    // set temporary parameter for inline output.
    layout.width = width;
    layout.height = height;
    layout.init();
    context.seekNextLine = 0;
    context.seekNextChar = 0;
    context.pageHtml = "";

    // output inline page.
    var page = this.outputPage(true);

    // append nextLineTokens to tail of lineTokens.
    if(context.nextLineTokens.length > 0){
      for(var i = 0; i < context.nextLineTokens.length; i++)(function(token){
	context.lineTokens.push(token);
	context.seekNextChar += token.nextOffset;
      })(context.nextLineTokens[i]);
      context.nextLineTokens = new Array();
    }

    // restore main parameter.
    layout.width = backupWidth;
    layout.height = backupHeight;
    layout.init();
    context.seekNextLine = backupSeekNextLine;
    context.pageHtml = backupHtml;

    return page;
  };

  StreamParser.prototype.makePageText = function(lexer, layout, context, inline){
    var output = Util.tagWrap("div", {
      "class":inline? "nehan-page nehan-page-inline" : "nehan-page",
      style:Util.inlineCss({
	width:layout.width + "px",
	height:layout.height + "px",
	"font-size":layout.fontSize + "px",
	"white-space":"nowrap"
      })
    }, context.pageHtml);

    context.pageHtml = "";
    context.seekNextLine = 0;
    if(!inline){
      context.curPageNo++;
    }
    return output;
  };

  StreamParser.prototype.setElementHandler = function(tagName, callback){
    this.elementHandler[tagName] = callback;
  };

  StreamParser.prototype.getNextToken = function(lexer, context){
    if(context.repushTokenStack.length > 0){
      return context.repushTokenStack.pop();
    }
    return lexer.getNext();
  };

  StreamParser.prototype.reset = function(layout){
    this.lexer.getStream().setSeekPos(0);
    this.layout = layout;
    this.context = new ParserContext(layout);
    this.tocTable = [];
    this.parseEnd = false;
  };

  StreamParser.prototype.outputPage = function(inline){
    while(true){
      try {
	var token = this.getNextToken(this.lexer, this.context);
	if(token.type == "char"){
	  this.parseChar(this.lexer, this.layout, this.context, token);
	} else if (token.type == "word"){
	  this.parseWord(this.lexer, this.layout, this.context, token);
	} else if (token.type == "tcy"){
	  this.parseTcy(this.lexer, this.layout, this.context, token);
	} else if (token.type == "tag"){
	  this.parseTag(this.lexer, this.layout, this.context, token, inline);
	}
      } catch (e){
	if(e == "BufferEnd"){
	  this.parseEnd = true;
	  if(this.context.lineTokens.length > 0){
	    try {
	      this.pushLine(this.lexer, this.layout, this.context, false);
	    } catch (e){
	      if(e == "PageEnd"){
		this.parseEnd = false;
	      }
	    }
	  }
	  return this.makePageText(this.lexer, this.layout, this.context, inline);
	} else if (e == "PageEnd"){
	  return this.makePageText(this.lexer, this.layout, this.context, inline);
	} else {
	  throw e;
	}
      }
    }
  };

  // ------------------------------------------------------------------------
  // ParserProxy
  // ------------------------------------------------------------------------
  function ParserProxy(layout, lexer, parser){
    this.layout = layout;
    this.lexer = lexer;
    this.parser = parser;
    this.stream = this.lexer.stream;
  }

  ParserProxy.prototype.getContext = function(){
    return this.parser.context;
  };

  ParserProxy.prototype.getLayout = function(){
    return this.layout;
  };

  ParserProxy.prototype.createTagToken = function(name, attr){
    return {type:"tag", data:{name:name, attr:attr}, pos:-1};
  };

  ParserProxy.prototype.skipCRLF = function(){
    this.lexer.skipCRLF();
  };

  ParserProxy.prototype.pushLine = function(){
    this.parser.pushLine(this.lexer, this.layout, this.parser.context, false);
  };

  ParserProxy.prototype.pushSpaceLine = function(lineHeight){
    this.parser.pushSpaceLine(this.lexer, this.layout, this.parser.context, lineHeight);
  };

  ParserProxy.prototype.startFont = function(attr){
    this.parser.parseFontStart(this.lexer, this.layout, this.parser.context, this.createTagToken("font", attr));
  };

  ParserProxy.prototype.endFont = function(){
    this.parser.parseFontEnd(this.lexer, this.layout, this.parser.context, this.createTagToken("/font", {}));
  };

  ParserProxy.prototype.startIndent = function(before, after){
    this.parser.parseIndentStart(this.lexer, this.layout, this.parser.context, this.createTagToken("indent", {before:before, after:after}));
  };

  ParserProxy.prototype.endIndent = function(){
    this.parser.parseIndentEnd(this.lexer, this.layout, this.parser.context, this.createTagToken("/indent", {}));
  };

  ParserProxy.prototype.pushImg = function(attr){
    this.parser.parseImg(this.lexer, this.layout, this.parser.context, this.createTagToken("img", attr));
  };

  ParserProxy.prototype.pushChar = function(c1){
    this.parser.parseChar(this.lexer, this.layout, this.parser.context, this.lexer.character(-1, c1));
  };

  ParserProxy.prototype.pushWord = function(word){
    this.parser.parseWord(this.lexer, this.layout, this.parser.context, this.lexer.word(-1, word));
  };

  ParserProxy.prototype.pushTcy = function(tcy){
    this.parser.parseTcy(this.lexer, this.layout, this.parser.context, this.lexer.tcy(-1, tcy));
  };

  // ------------------------------------------------------------------------
  // PageProvider
  // ------------------------------------------------------------------------
  function PageProvider(layoutOpt, text, totalLength){
    this.layout = new Layout(layoutOpt);
    if(totalLength){
      this.lexer = new StreamLexer(new TextStream(text, totalLength, text.length >= totalLength));
    } else {
      this.lexer = new StreamLexer(new TextStream(text, text.length, true));
    }
    this.parser = new StreamParser(this.lexer, this.layout);
    this.parserProxy = new ParserProxy(this.layout, this.lexer, this.parser);
    this.pageHeadPos = [{spos:0, cpos:0}];
    this.resuming = false;
    this.cache = [];
    this.restoreContext = null;
  };

  PageProvider.prototype.reset = function(layoutOpt){
    this.layout = new Layout(layoutOpt);
    this.parser.reset(this.layout);
    this.cache = [];
  };

  PageProvider.prototype.hasNextPage = function(){
    return this.parser.hasNextPage();
  };

  PageProvider.prototype.isEnablePage = function(pageNo){
    if(pageNo == 0){
      return true;
    }
    if(this.cache[pageNo]){
      return true;
    }
    if(this.cache.length == pageNo && this.parser.hasNextPage()){
      return true;
    }
    return false;
  };

  PageProvider.prototype.getLayout = function(){
    return this.layout;
  };

  PageProvider.prototype.getText = function(){
    return this.lexer.getStream().getText();
  };

  PageProvider.prototype.setText = function(text){
    return this.lexer.getStream().setText(text);
  };

  PageProvider.prototype.addText = function(text){
    return this.lexer.getStream().addText(text);
  };

  PageProvider.prototype.isEOF = function(){
    return this.lexer.getStream().isEOF();
  };

  PageProvider.prototype.getTocTable = function(){
    return this.parser.getTocTable();
  };

  PageProvider.prototype.getTocCount = function(){
    return this.parser.getTocTable().length;
  };

  PageProvider.prototype.getPageCount = function(){
    return this.parser.context.curPageNo;
  };

  PageProvider.prototype.setElementHandler = function(tagName, callback){
    var self = this;
    this.parser.setElementHandler(tagName, function(parser, lexer, layout, context, token){
      callback(self.parserProxy, token.data);
    });
  };

  PageProvider.prototype.setPageHeadPos = function(pageNo, spos, cpos){
    this.pageHeadPos[pageNo] = {spos:spos, cpos:cpos};
  };

  PageProvider.prototype.getPageHeadPos = function(pageNo){
    return this.pageHeadPos[pageNo];
  };

  PageProvider.prototype.setPageCache = function(pageNo, data){
    this.cache[pageNo] = data;
  };

  PageProvider.prototype.getPageSourceText = function(pageNo){
    if(pageNo + 1< this.getPageCount()){
      var from = this.getPageHeadPos(pageNo).spos;
      var to = this.getPageHeadPos(pageNo + 1).spos;
      var src = this.lexer.getStream().getText();
      return src.substring(from, to);
    }
    return "";
  };

  PageProvider.prototype.getPageNoFromSeekPos = function(seekPos){
    for(var i = 0; i < this.pageHeadPos.length - 1; i++){
      if(this.pageHeadPos[i].spos <= seekPos && seekPos < this.pageHeadPos[i+1].spos){
	return i;
      }
    }
    if(this.pageHeadPos[i].spos <= seekPos && seekPos <= this.lexer.getStream().getText().length){
      return i;
    }
    return -1;
  };

  PageProvider.prototype.outputPage = function(pageNo){
    if(this.cache[pageNo]){
      return this.cache[pageNo];
    }
    if(!this.resuming && !this.lexer.getStream().isEOF()){
      this.restoreContext = Util.deepCopy(this.parser.context);
    }
    var head = this.getPageHeadPos(pageNo);
    try {
      var html = this.parser.outputPage(false);
      var percent = this.lexer.getStream().getSeekPercent();
      var spos = this.lexer.getStream().isEOF()? this.parser.context.pageHeadPos : this.lexer.getStream().getSeekPos();
      var cpos = this.parser.context.curCharCount;
      if(!this.parser.hasNextPage()){
	this.pageCount = pageNo + 1;
      }
      this.resuming = false;
      this.setPageHeadPos(pageNo+1, spos, cpos);
      this.cache[pageNo] = {
	html:html,
	percent:percent,
	spos:head.spos,
	cpos:head.cpos
      };
      return this.cache[pageNo];
    } catch (e){
      if(e == "BufferShort"){
	this.resuming = true;
	this.parser.context = Util.deepCopy(this.restoreContext);
	this.parser.lexer.getStream().setSeekPos(head.spos);
      }
      throw e;
    }
  };

  // ------------------------------------------------------------------------
  // LayoutGrid
  // ------------------------------------------------------------------------
  function LayoutGrid(node, nodeNo, opt){
    this.node = node;
    this.nodeNo = nodeNo;
    this.groupName = "nehan-layout-group-" + nodeNo;
    this.order = 0;
    this.isEnd = false;
    this.direction = "vertical";
    this.fontSize = 16;
    this.fontColor = "000000";
    this.linkColor = "0000FF";
    this.width = 400;
    this.height = 300;
    this.init(node.className);
  }

  LayoutGrid.prototype.init = function(className){
    var list = className.split(/[\s\t]/);
    for(var i=0; i< list.length; i++){
      var klass = list[i];
      if (klass == "lp-vertical"){
	this.direction = "vertical";
      } else if (klass == "lp-horizontal"){
	this.direction = "horizontal";
      } else if (klass.match(/span-([0-9]+)/)){ // blueprint.css
	this.width = parseInt(RegExp.$1) * 40 - 10;
      } else if (klass.match(/lp-width-([0-9]+)/)){
	this.width = parseInt(RegExp.$1);
      } else if (klass.match(/lp-height-([0-9]+)/)) {
	this.height = parseInt(RegExp.$1);
      } else if (klass.match(/lp-font-size-([0-9]+)/)){
	this.fontSize = parseInt(RegExp.$1);
      } else if (klass.match(/lp-font-color-(.+)/)){
	this.fontColor = RegExp.$1.toUpperCase();
      } else if (klass.match(/lp-link-color-(.+)/)){
	this.linkColor = RegExp.$1.toUpperCase();
      } else if (klass.match(/lp-group-([a-zA-Z0-9\-_]+)/)){
	this.groupName = RegExp.$1;
      } else if (klass.match(/lp-order-([0-9]+)/)){
	this.order = parseInt(RegExp.$1);
      } else if (klass == "lp-end"){
	this.isEnd = true;
      }
    }
    var style = this.node.style;
    style.width = this.width + "px";
    style.height = this.height + "px";
  };

  LayoutGrid.prototype.getLayout = function(){
    return new Layout({
      direction:this.direction,
      width: this.width,
      height: this.height,
      fontSize: this.fontSize,
      fontColor: this.fontColor,
      linkColor: this.linkColor
    });
  };

  LayoutGrid.prototype.getText = function(convBR){
    var text = this.node.innerHTML;
    if(convBR){
      return text.replace(/<br>/gi, "\n").replace(/<br \/>/gi, "\n");
    }
    return text.replace(/<br>/gi, "").replace(/<br \/>/gi, "");
  };

  // ------------------------------------------------------------------------
  // LayoutGridGroup
  // ------------------------------------------------------------------------
  function LayoutGridGroup(groupName, opt){
    this.grids = [];
    this.groupName = groupName;
    this.opt = opt;
  };

  LayoutGridGroup.prototype.init = function(){
    this.grids.sort(function(g1,g2){ return g1.order - g2.order; });
    this.provider = new PageProvider(this.grids[0].getLayout(), this.grids[0].getText(this.opt.convBR || true));
    this.rootNode = document.createElement("div");
    return this;
  };

  LayoutGridGroup.prototype.append = function(grid){
    this.grids.push(grid);
  };

  LayoutGridGroup.prototype.renderGrid = function(grid, pageNo){
    this.provider.layout.width = grid.width;
    this.provider.layout.height = grid.height;
    this.provider.layout.direction = grid.direction;
    this.provider.layout.fontColor = grid.fontColor;
    this.provider.layout.init();
    this.provider.parser.context.curFontColor = grid.fontColor;
    grid.node.innerHTML = this.provider.outputPage(pageNo).html;
  };

  LayoutGridGroup.prototype.appendRestGrid = function(tailGrid, pageNo){
    var node = document.createElement("div");
    node.innerHTML = this.provider.outputPage(pageNo).html;
    node.className = "nehan-rest-grid";
    tailGrid.node.appendChild(node);
  };

  LayoutGridGroup.prototype.render = function(){
    for(var i = 0; i < this.grids.length; i++){
      var grid = this.grids[i];
      if(!this.provider.hasNextPage()){
	break;
      }
      this.renderGrid(grid, i);
      if(grid.isEnd){
	return;
      }
    }
    var tailGrid = this.grids[i-1];
    tailGrid.node.style.height = "auto";
    while(this.provider.hasNextPage()){
      this.appendRestGrid(tailGrid, i++);
    }
  };

  // ------------------------------------------------------------------------
  // LayoutMapper
  // ------------------------------------------------------------------------
  var LayoutMapper = {
    // opt(default): {linkColor:0000FF, convBR:true}
    start : function(opt){
      var opt = opt || {};
      var groups = {};
      var nodes = document.getElementsByTagName("pre");
      for(var nodeNo = 0; nodeNo < nodes.length; nodeNo++)(function(node){
	var className = node.className;
	if(className.match(/lp-vertical/i) || className.match(/lp-horizontal/i)){
	  var grid = new LayoutGrid(node, nodeNo);
	  if(!groups[grid.groupName]){
	    groups[grid.groupName] = new LayoutGridGroup(grid.groupName, opt);
	  }
	  groups[grid.groupName].append(grid);
	}
      })(nodes[nodeNo]);

      for(groupName in groups){
	(groups[groupName].init()).render();
      }
    }
  };

  // namespace
  Nehan.Util = Util;
  Nehan.Env = Env;
  Nehan.Layout = Layout;
  Nehan.TextStream = TextStream;
  Nehan.StreamLexer = StreamLexer;
  Nehan.StreamParser = StreamParser;
  Nehan.PageProvider = PageProvider;
  Nehan.ParserProxy = ParserProxy;
  Nehan.LayoutMapper = LayoutMapper;
})();

