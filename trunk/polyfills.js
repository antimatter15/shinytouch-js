// The title is misleading, it's actually mostly convenience functions

/* requestAnimationFrame polyfill
 * by Eric Moller
 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 */
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelRequestAnimationFrame = window[vendors[x]+
          'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}())

/*!
* BigScreen
* v1.0.0 - 2012-08-26
* https://github.com/bdougherty/BigScreen
* Copyright 2012 Brad Dougherty; Apache 2.0 License
*/
(function(a,b,c){function f(a,b,c){var d;return function(){var e=this,f=arguments,g=function(){d=null,c||a.apply(e,f)},h=c&&!d;clearTimeout(d),d=setTimeout(g,b),h&&a.apply(e,f)}}function g(a){var b=null;if(a.tagName==="VIDEO")b=a;else{var c=a.getElementsByTagName("video");c[0]&&(b=c[0])}return b}function i(a){var b=g(a);if(b&&b.webkitEnterFullscreen){try{b.readyState<b.HAVE_METADATA?(b.addEventListener("loadedmetadata",function d(){b.removeEventListener("loadedmetadata",d,!1),b.webkitEnterFullscreen()},!1),b.load()):b.webkitEnterFullscreen(),h=b,b.play(),n(),setTimeout(j,500)}catch(c){p.onerror.call(b)}return}p.onerror.call(a)}function j(){if(h){if(h.webkitDisplayingFullscreen===!0)return setTimeout(j,500);o()}}function k(){p.element||(o(),m())}function l(){c&&e.change==="webkitfullscreenchange"&&a.addEventListener("resize",k,!1)}function m(){c&&e.change==="webkitfullscreenchange"&&a.removeEventListener("resize",k,!1)}"use strict";var d=typeof Element!="undefined"&&"ALLOW_KEYBOARD_INPUT"in Element,e=function(){var a=[{request:"requestFullscreen",exit:"exitFullscreen",enabled:"fullscreenEnabled",element:"fullscreenElement",change:"fullscreenchange",error:"fullscreenerror"},{request:"webkitRequestFullscreen",exit:"webkitExitFullscreen",enabled:"webkitFullscreenEnabled",element:"webkitFullscreenElement",change:"webkitfullscreenchange",error:"webkitfullscreenerror"},{request:"webkitRequestFullScreen",exit:"webkitCancelFullScreen",element:"webkitCurrentFullScreenElement",change:"webkitfullscreenchange",error:"webkitfullscreenerror"},{request:"mozRequestFullScreen",exit:"mozCancelFullScreen",enabled:"mozFullScreenEnabled",element:"mozFullScreenElement",change:"mozfullscreenchange",error:"mozfullscreenerror"}],c=!1,d=b.createElement("video");for(var e=0;e<a.length;e++)if(a[e].request in d){c=a[e];for(var f in c)!("on"+c[f]in b)&&!(c[f]in b)&&!(c[f]in d)&&delete c[f];break}return d=null,c}(),h=null,n=f(function(){p.onenter.call(p)},100,!0),o=f(function(){p.onexit.call(p)},200,!0),p={request:function(a){a=a||b.documentElement;if(e.request===undefined)return i(a);if(c&&b[e.enabled]===!1)return i(a);if(c&&e.enabled===undefined){e.enabled="webkitFullscreenEnabled",a[e.request](),setTimeout(function(){b[e.element]?b[e.enabled]=!0:(b[e.enabled]=!1,i(a))},250);return}try{a[e.request](d&&Element.ALLOW_KEYBOARD_INPUT),b[e.element]||a[e.request]()}catch(f){p.onerror.call(a)}},exit:function(){m(),b[e.exit](),h=null},toggle:function(a){p.element?p.exit():p.request(a)},videoEnabled:function(a){if(p.enabled)return!0;var b=g(a);return!b||b.webkitSupportsFullscreen===undefined?!1:b.readyState<b.HAVE_METADATA?"maybe":b.webkitSupportsFullscreen},onenter:function(){},onexit:function(){},onerror:function(){}};try{Object.defineProperties(p,{element:{enumerable:!0,get:function(){return h&&h.webkitDisplayingFullscreen?h:b[e.element]||null}},enabled:{enumerable:!0,get:function(){return e.exit==="webkitCancelFullScreen"&&!c?!0:b[e.enabled]||!1}}})}catch(q){p.element=null,p.enabled=!1}e.change&&b.addEventListener(e.change,function(a){p.element?(n(),l()):o()},!1),e.error&&b.addEventListener(e.error,function(a){p.onerror.call(a.target)},!1),a.BigScreen=p})(window,document,self!==top);

/* fake Uint8ClampedArray for browsers that support CanvasPixelArray
 * by me
 * https://gist.github.com/2295355
 */
if (!window.Uint8ClampedArray && window.Uint8Array && window.ImageData) {
window.Uint8ClampedArray = function(input,arg1,arg2) {
	var len = 0;
	if (typeof input == "undefined") { }
	else if (!isNaN(parseInt(input.length))) { //an array, yay
		len = input.length;
	}
	else if (input instanceof ArrayBuffer) {
		return new Uint8ClampedArray(new Uint8Array(input,arg1,arg2));
	}
	else {
		len = parseInt(input);
		if (isNaN(len) || len < 0) {
			throw new RangeError();
		}
		input = undefined;
	}
	len = Math.ceil(len / 4);

	if (len == 0) len = 1;

	var array = document.createElement("canvas")
	              .getContext("2d")
	              .createImageData(len, 1)
	              .data;

	if (typeof input != "undefined") {
		for (var i=0;i<input.length;i++) {
			array[i] = input[i];
		}
	}
	try {
		Object.defineProperty(array,"buffer",{
			get: function() {
				return new Uint8Array(this).buffer;
			}
		});
	} catch(e) { try {
		array.__defineGetter__("buffer",function() {
			return new Uint8Array(this).buffer;
		});
	} catch(e) {} }
	return array;
}
}

/* gUM shield!
 * half by me, sort of, see
 * https://gist.github.com/f9986533817575de62d8
 */
//normalize window.URL
window.URL || (window.URL = window.webkitURL || window.msURL || window.oURL);

//normalize navigator.getUserMedia
navigator.getUserMedia || (navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

function getUserMedia(opts, success, fail) {
	if (!navigator.getUserMedia) fail(new Error("getUserMedia not supported"));

	try {
		navigator.getUserMedia(opts,success,fail);
	} catch(e) {
		var stringopts = [];
		for (var i in opts) {
			if (opts[i] == true) {
				stringopts.push(i);
			}
		}
		stringopts = stringopts.join(",");
		try {
			navigator.getUserMedia(stringopts,success,fail);
		} catch(e) {
			fail(new Error("getUserMedia not supported"));
		}
	}
}

/* randInt
 * by me
 * https://gist.github.com/2371754
 */
function randInt(a,b){return a+Math.floor(Math.random()*(++b-a))}


/* RGB to HSL conversion
 * http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
 */
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}
