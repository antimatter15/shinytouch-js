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

/* fullscreen api something
 * by me
 * https://gist.github.com/2302950
 */
function toggleFullScreen(el,override) {
	if (override == true) {

		el = (el instanceof Element) ? el : document.documentElement;

		[ "requestFullscreen",
		  "requestFullScreen",
		  "mozRequestFullScreen",
		  "webkitRequestFullscreen",
		  "webkitRequestFullScreen",
		  "webkitEnterFullscreen"].forEach(function(c) {
			if (el[c]) {
				el[c]();
				return true;
			}
		});
	} else if (override == false) {
		[ "exitFullscreen",
		  "cancelFullScreen",
		  "mozCancelFullScreen",
		  "webkitCanvelFullscreen",
		  "webkitCancelFullScreen",
		  "webkitExitFullscreen"].forEach(function(c) {
			if (document[c]) {
				document[c]();
				return true;
			}
		});
	} else {
		if((!window.fullScreen && !document.mozFullScreen && !document.webkitIsFullScreen) ||
		   (document.fullscreenElement && document.fullscreenElement === null) ||
		   (document.fullScreenElement && document.fullScreenElement === null)) {
			return toggleFullScreen(el,true);
		} else {
			return toggleFullScreen(el,false);
		}
	}
	return false;
}
/* firing events from multiple places */
function fireEvent(el, evtName) {
	if (document.createEventObject) {
		var evt = document.createEventObject();
		return el.fireEvent("on" + evtName, evt);
	} else {
		var evt = document.createEvent("Events");
		evt.initEvent(evtName, true, true);
		return !el.dispatchEvent(evt);
	}
}

// doesn't quite work
document.addEventListener("mozfullscreenchange", function(e) {
	fireEvent(document,"fullscreenchange");
},false);
document.addEventListener("webkitfullscreenchange", function(e) {
	fireEvent(document,"fullscreenchange");
},false);

/* fake Uint8ClampedArray for browsers that support CanvasPixelArray
 * by me
 * https://gist.github.com/2295355
 */
if (!window.Uint8ClampedArray && Uint8Array &&
    (function(){
    	try { return document.createElement("canvas").getContext("2d").getImageData; }
    	catch(e) { return false; } 
    }())) {
window.Uint8ClampedArray = function(input,arg1,arg2) {
	if (!(this instanceof Uint8ClampedArray)) {
		throw new TypeError("DOM object constructor cannot be called as a function.");
	}
	var len = 0;
	if (input.length) { //an array, yay
		len = input.length;
	} else if (input.constructor == ArrayBuffer) {
		return new Uint8ClampedArray(new Uint8Array(input,arg1,arg2));
	} else {
		len = Number(input);
		input = null;
	}

	if (len != Math.abs(len) << 0) { // also catches Number() parse fails
		throw new RangeError();
	}
	len = Math.ceil(len / 4) * 4; // round up to the nearest mult of 4

	var canvas = document.createElement("canvas");
	canvas.width = len / 4; // the CanvasPixelArray will have dims 4 * width * height
	canvas.height = 1;

	var array = canvas.getContext("2d").getImageData(0,0,len/4,1).data;

	if (input) {
		for (var i=0;i<input.length;i++) {
			array[i] = input[i];
		}
	}
	if (Object.defineProperty) {
		Object.defineProperty(array,"buffer",{
			get: function() {
				return new Uint8Array(this).buffer;
			}
		});
	} else if (Object.prototype.__defineGetter__) {
		array.__defineGetter__("buffer",function() {
			return new Uint8Array(this).buffer;
		});
	}
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