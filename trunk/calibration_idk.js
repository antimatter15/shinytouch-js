window.calibration_algorithms || (calibration_algorithms = []);
window.update_sequences || (update_sequences = []);

calibration_algorithms["idk"] = function(win) {
	function fastabs(n){return ((n-1)>>31)?-n:n}

	function init() { //for calculating camera delay
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		canvas.width = screen.width; canvas.height = screen.height;
		
		canvas.style.border = "1px solid black";
		cont.appendChild(document.createElement("br"));
		cont.appendChild(canvas);
		
		// init done, calculate camera delay
		
		// first get a couple of diffs (CAPTURE_ATTEMPTS factorial)
		const INTERVAL_MIN = 200, INTERVAL_MAX = 1000, CAPTURE_ATTEMPTS = 3;
		
		var pixelDatas = [];
		for (i=0;i<CAPTURE_ATTEMPTS;i++) {
			setTimeout(function(){
				pixelDatas.push(ctx.getImageData(0,0,canvas.width,canvas.height));
			},randInt(INTERVAL_MIN,INTERVAL_MAX));
		}
		setTimeout(function(){init2(pixelDatas)},INTERVAL_MAX * CAPTURE_ATTEMPTS);
	}
	function init2(pixelDatas) {
		console.log(pixelDatas);
	}
	function calculateImageDiffLevel(olddata,newdata) {
		if (olddata.length != newdata.length) {
			throw new RangeError("lengths must be the same");
		}
		var total = 0, len = olddata.length;
		for (i=0;i<len;i+=4) {
			total += (olddata[i] + olddata[i+1] + olddata[i+2])
			       - (newdata[i] + newdata[i+1] + newdata[i+2]);
		}
		console.log("did average diff thing: "+(total / len));
		return total / len;
	}
	
	/////////////////////////////////////////////////////////////////
	var calibration_options = {
		screen_width: screen.width / 2,
		screen_height: screen.height / 2,
		current_algorithm : "idk"
	},
	    i;
	
	win.$ = function(d){return win.document.getElementById(d)};
	
	var cont = win.$("container");
	cont.innerHTML = 'Please drag this to the appropriate window and make it fullscreen before you '
	               + '<button id="begin">begin</button>.';
	win.$("begin").onclick = init;
	
}