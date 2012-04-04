/* requestAnimationFrame polyfill
 * by Eric Moller
 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 */
(function(){var a=0,b=["ms","moz","webkit","o"];for(var c=0;c<b.length&&!window.requestAnimationFrame;++c)window.requestAnimationFrame=window[b[c]+"RequestAnimationFrame"],window.cancelRequestAnimationFrame=window[b[c]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(b,c){var d=(new Date).getTime(),e=Math.max(0,16-(d-a)),f=window.setTimeout(function(){b(d+e)},e);return a=d+e,f}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)})})()

/* fullscreen api something
 * by me
 * https://gist.github.com/2302950
 */
function toggleFullScreen(a){!window.fullScreen&&!document.mozFullScreen&&!document.webkitIsFullScreen||document.fullscreenElement&&document.fullscreenElement===null||document.fullScreenElement&&document.fullScreenElement===null?(a=a instanceof Element?a:document.documentElement,["requestFullscreen","requestFullScreen","mozRequestFullScreen","webkitRequestFullscreen","webkitRequestFullScreen","webkitEnterFullscreen"].forEach(function(b){a[b]&&a[b]()})):["exitFullscreen","cancelFullScreen","mozCancelFullScreen","webkitCanvelFullscreen","webkitCancelFullScreen","webkitExitFullscreen"].forEach(function(a){document[a]&&document[a]()})}function fireEvent(a,b){if(document.createEventObject){var c=document.createEventObject();return a.fireEvent("on"+b,c)}var c=document.createEvent("Events");return c.initEvent(b,!0,!0),!a.dispatchEvent(c)}document.addEventListener("mozfullscreenchange",function(a){fireEvent(document,"fullscreenchange")},!1),document.addEventListener("webkitfullscreenchange",function(a){fireEvent(document,"fullscreenchange")},!1)

/* fake Uint8ClampedArray for browsers that support CanvasPixelArray
 * by me
 * https://gist.github.com/2295355
 */
!window.Uint8ClampedArray&&Uint8Array&&function(){try{return document.createElement("canvas").getContext("2d").getImageData}catch(a){return!1}}()&&(window.Uint8ClampedArray=function(a,b,c){if(this instanceof Uint8ClampedArray){var d=0;if(a.length)d=a.length;else{if(a.constructor==ArrayBuffer)return new Uint8ClampedArray(new Uint8Array(a,b,c));d=Number(a),a=null}if(d!=Math.abs(d)<<0)throw new RangeError;d=Math.ceil(d/4)*4;var e=document.createElement("canvas");e.width=d/4,e.height=1;var f=e.getContext("2d").getImageData(0,0,d/4,1).data;if(a)for(var g=0;g<a.length;g++)f[g]=a[g];return Object.defineProperty?Object.defineProperty(f,"buffer",{get:function(){return(new Uint8Array(this)).buffer}}):Object.prototype.__defineGetter__&&f.__defineGetter__("buffer",function(){return(new Uint8Array(this)).buffer}),f}throw new TypeError("DOM object constructor cannot be called as a function.")})

/* gUM shield!
 * by me, sort of, see
 * https://gist.github.com/f9986533817575de62d8
 */
function getUserMedia(a,b,c){navigator.getUserMedia||c(new Error("getUserMedia not supported"));try{navigator.getUserMedia(a,b,c)}catch(d){var e=[];for(var f in a)a[f]==1&&e.push(f);e=e.join(",");try{navigator.getUserMedia(e,b,c)}catch(d){c(new Error("getUserMedia not supported"))}}}window.URL||(window.URL=window.webkitURL||window.msURL||window.oURL),navigator.getUserMedia||(navigator.getUserMedia=navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia)