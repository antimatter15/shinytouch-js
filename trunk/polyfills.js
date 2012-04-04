/* requestAnimationFrame polyfill */
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
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
}());

/* fullscreen api shim, from MDN and modified by me, yes it's messier than it should be */
function toggleFullScreen(el, onfullscreen, onunfullscreen) {
	if ((!window.fullScreen && !document.mozFullScreen && !document.webkitIsFullScreen) ||
	    (document.fullscreenElement && document.fullscreenElement === null) ||
	    (document.fullScreenElement && document.fullScreenElement === null)) {
		
		el = (el instanceof Element) ? el : document.documentElement;
		
		if (el.requestFullscreen) {
			el.requestFullscreen();
		} else if (el.requestFullScreen) {
			el.requestFullScreen();
		} else if (el.mozRequestFullScreen) {
			el.mozRequestFullScreen();
		} else if (el.webkitRequestFullScreen) {
			el.webkitRequestFullScreen();
		} else if (el.wekbitEnterFullscreen) {
			el.webkitEnterFullscreen();
		} else {
			throw new Error("No fullscreen support!");
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.cancelFullScreen) {
			document.cancelFullScreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	}
}

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
document.addEventListener("mozfullscreenchange", function(e) {
	fireEvent(document,"fullscreenchange");
},false);
document.addEventListener("webkitfullscreenchange", function(e) {
	fireEvent(document,"fullscreenchange");
},false);

/* fake Uint8ClampedArray for browsers that support CanvasPixelArray */

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
	
	if (len != Math.abs(len) << 0) {
		throw new RangeError();
	}
	len = Math.ceil(len / 4) * 4;
	
	var canvas = document.createElement("canvas");
	canvas.width = len / 4;
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
