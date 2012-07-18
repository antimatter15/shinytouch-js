window.calibration_algorithms || (calibration_algorithms = {});
window.update_sequences || (update_sequences = []);

calibration_algorithms["idk"] = function(win) {
	function fastabs(n){return ((n-1)>>31)?-n:n}
	
	var cameraDelay = -1;
	
	var canvas = document.createElement("canvas"),
	    ctx = canvas.getContext("2d");
	
	canvas.width = screen.width; canvas.height = screen.height;
	
	function init() { //for calculating camera delay
		
		// constants		
		const CAPTURE_INTERVAL = 200,
		      IMAGE_CAPTURES   = 6,
		      OVER_DIFF_LIMIT  = 10;
		
		captureImageSequence(video,CAPTURE_INTERVAL,IMAGE_CAPTURES,function(){},function(pixelDatas) {
			console.log(pixelDatas);
			
			var diffLevels = [];
		
			pixelDatas.reduce(function(prev,cur,i) {
				imageLog(cur,"Image "+i);
				
				if (prev) {
					diffLevels.push(imageDiffLevel(prev,cur));
				}
				return cur;
			},null);
			console.log(diffLevels);
			
			// make sure none of the values are 0
			// if one is, that means the camera didn't update fast enough
			if (diffLevels.some(function(el){return el == 0})) {
				win.alert("Your camera is too slow! :-(");
				return;
			}
			
			var changeFrame = 0;
			
			for (var i=0;i<diffLevels.length;i++) {
				var diffLevel = diffLevels[i];
				// camera didn't update fast enough, and we got multiple shots of the same frame
				if (diffLevel == 0) {
					console.error("Camera too slow - "+i);
					win.alert("Your camera is too slow! :(");
					return;
				} else if (diffLevel > OVER_DIFF_LIMIT) {
					if (changeFrame) { // more than one diff over limit!
						console.error("More than one change frame - "+i);
						win.alert("Your camera is too shaky! :(");
						return;
					} else {
						changeFrame = i + 1;
						console.log("Change frame: "+changeFrame);
					}
				}
			}
			if (!changeFrame) {
				console.error("No change frame!");
				win.alert("The screen color change wasn't visible! :(");
				return;
			}
			
			cameraDelay = CAPTURE_INTERVAL * (changeFrame - 1); // we change at capture interval 1
			
			console.log("changeFrame:",changeFrame,"cameraDelay:",cameraDelay);
			
			
			var averageImage = imageAverage.apply(null,pixelDatas.slice(0,changeFrame));
			imageLog(averageImage,"Average image");
			
			actualCalibration();
		});
		// ** RANDOM CONSTANT **
		setTimeout(function() {
			ctx.fillRect(0,0,canvas.width,canvas.height);
		},CAPTURE_INTERVAL); // so at least one blank frame is captured.
	}
	function actualCalibration() {
	}
	
	
	// ** SHARED FUNCTIONS ** 
	
	// how much every r, g, b value differs from each other on average (0 to 255)
	function imageDiffLevel(olddata,newdata) {
		olddata = olddata.data, newdata = newdata.data;
		if (olddata.length != newdata.length) {
			throw new RangeError("lengths must be the same");
		}
		var total = 0, len = olddata.length;
		for (var i=0;i<len;i+=4) {
			total += fastabs(olddata[i  ] - newdata[i  ]);
			total += fastabs(olddata[i+1] - newdata[i+1]);
			total += fastabs(olddata[i+2] - newdata[i+2]);
		}
		return total / (len * 3 / 4); // because no one cares about opacity.
	}
	function imageDiff(data1,data2) {
		data1 = data1.data, data2 = data2.data;
		if (data1.length != data2.length) {
			throw new RangeError("lengths must be the same");
		}
		var len = data1.length,
		    output = ctx.createImageData(data1.width,data1.height); // blank
		
		for (var i=0;i<len;i+=4) {
			output.data[i  ] = fastabs(data1[i  ] - data2[i  ]);
			output.data[i+1] = fastabs(data1[i+1] - data2[i+1]);
			output.data[i+2] = fastabs(data1[i+2] - data2[i+2]);
			output.data[i+3] = 0xff;
		}
		return output;
	}
	function imageAverage() {
		var datas = [].slice.call(arguments),
		    len = datas[0].data.length,
		    factor = datas.length,
		    output = ctx.createImageData(datas[0].width,datas[0].height);
		
		datas = datas.map(function(el) {
			if (el.data.length != len) {
				throw new RangeError("lengths must be the same");
			}
			return el.data;
		});
		
		for (var i=0;i<len;i+=4) {
			var sumR = 0, sumG = 0, sumB = 0;
			
			datas.forEach(function(data){
				sumR += data[i  ];
				sumG += data[i+1];
				sumB += data[i+2];
			});
			
			output.data[i  ] = sumR / factor;
			output.data[i+1] = sumG / factor;
			output.data[i+2] = sumB / factor;
			output.data[i+3] = 0xff;
		}
		return output;
	}		
			
	// ** INITIALIZATION **
	calibration_options = {
		screen_width: screen.width / 2,
		screen_height: screen.height / 2,
		current_algorithm : "idk"
	};
	
	win.$ = function(d){return win.document.getElementById(d)};
	
	var body = win.document.body;
	
	var cont = win.$("message");
	cont.innerHTML = 'Please drag this window to the screen the camera is pointed at. '
	  + 'Make sure the camera\'s view is unobstructed and that nothing in its view '
	  + 'moves during calibration. <br \/><br \/>'
	  + 'To begin, make this window fullscreen by pressing the F11 key.';
	
	win.onresize = function() {
		console.log(win.innerWidth,win.innerHeight);
		if (win.innerWidth != screen.width || win.innerHeight != screen.height) {
			return;
		}
		win.onresize = null;
		
		var initTimeout = null;
		win.onkeypress = function(e) {
			win.close();
			win = null;
			clearTimeout(initTimeout);
		}
		cont.innerHTML = 'Auto-calibration will begin in 5 seconds. To cancel, press any key now.';
		initTimeout = setTimeout(function() {
			
			// begins the "calibration" process
			if (!win) { return; }
			win.onkeypress = null;
			cont.innerHTML = 'Please wait, calibrating...';
			body.style.cursor = 'none';
			update_sequences.push(update);
		
			canvas.style.position = "absolute";
			canvas.style.top="0";
			canvas.style.left="0";
		
			body.appendChild(canvas);
			
			// first calibration function
			init();
			
		},5000); // allow time to fullscreen
	}
	
	function update() {
		
	}
	function stop() {
		win.close();
		update_sequences.splice(update_sequences.indexOf(update),1);
		alert("done");
	}
	
}
