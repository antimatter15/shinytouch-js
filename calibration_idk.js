window.calibration_algorithms || (calibration_algorithms = []);
window.update_sequences || (update_sequences = []);

calibration_algorithms["idk"] = function(win) {
	function fastabs(n){return ((n-1)>>31)?-n:n}
	
	var canvas = document.createElement("canvas"),
	    ctx = canvas.getContext("2d");
	
	canvas.width = screen.width; canvas.height = screen.height;
	
	function init() { //for calculating camera delay
		update_sequences.push(update);
		
		canvas.style.position = "absolute";
		canvas.style.top="0";
		canvas.style.left="0";
		
		canvas.style.border = "1px solid black";
		cont.appendChild(document.createElement("br"));
		cont.appendChild(canvas);
		
		// init done, calculate camera delay
		
		// first get a couple of diffs (CAPTURE_ATTEMPTS factorial)
		
		// capture *3* images between every *50* and *200* milliseconds
		captureImageSequence(video,50,200,3,function(pixelDatas) {
			console.log(pixelDatas);
		
			imageLog(pixelDatas[0]);
			imageLog(pixelDatas[1]);
			imageLog(pixelDatas[2]);
			
			console.log(calculateImageDiffLevel(pixelDatas[0],pixelDatas[1]));
			console.log(calculateImageDiffLevel(pixelDatas[1],pixelDatas[2]));
			
			
			
			stop();
		});
	}
	function calculateImageDiffLevel(olddata,newdata) {
		olddata = olddata.data, newdata = newdata.data;
		if (olddata.length != newdata.length) {
			throw new RangeError("lengths must be the same");
		}
		var total = 0, len = olddata.length;
		for (i=0;i<len;i+=4) {
			total += (olddata[i] + olddata[i+1] + olddata[i+2])
			       - (newdata[i] + newdata[i+1] + newdata[i+2]);
		}
		return total / (len / 4);
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
	
	function update() {
		
	}
	function stop() {
		update_sequences.splice(update_sequences.indexOf(update),1);
	}
	
}