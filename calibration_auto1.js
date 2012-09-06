window.calibration_algorithms || (calibration_algorithms = {});
window.update_sequences || (update_sequences = []);

calibration_algorithms["auto1"] = function(win) {
		
	var cameraDelay = null, averageImage = null;
	
	var canvas = document.createElement("canvas"),
	    ctx = canvas.getContext("2d");
	
	canvas.width = screen.width; canvas.height = screen.height;
	
	
	// ** INITIALIZATION **
	calibration_options = {
		screen_width: screen.width / 2,
		screen_height: screen.height / 2,
		current_algorithm : "idk"
	};
	
	// like a repaint loop
	function update() {
		
	}
	update_sequences.push(update);
	
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
		initTimeout = setTimeout(init,5000); // allow time to fullscreen
	}
	
	function init() { // sets stuff up
		// begins the "calibration" process
		if (!win) { return; }
		win.onkeypress = null;
		cont.innerHTML = 'Please wait, calibrating...';
		body.style.cursor = 'none';
		update_sequences.push(update);
	
		canvas.style.position = "absolute";
		canvas.style.top = "0";
		canvas.style.left = "0";
		canvas.style.zIndex = "0";
	
		body.appendChild(canvas);
		
		// first calibration function
		calibration1();
	}
	
	function calibration1() { // for calculating camera delay
		
		// constants		
		const CAPTURE_INTERVAL = 250,
		      IMAGE_CAPTURES   = 6,
		      OVER_DIFF_LIMIT  = 8;
		
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
			
			cameraDelay = CAPTURE_INTERVAL * (changeFrame); // we change at capture interval 1
			
			console.log("changeFrame:",changeFrame,"cameraDelay:",cameraDelay);
			
			
			averageImage = imageAverage.apply(null,pixelDatas.slice(0,changeFrame));
			imageLog(averageImage,"Average image");
			
			//for (i=changeFrame;i<pixelDatas.length;i++) {
			//	imageLog(imageDiff(pixelDatas[i],averageImage),"Diff of Image "+i+" and average");
			//}
			
			calibration2();
		});
		// ** RANDOM CONSTANT **
		setTimeout(function() {
			ctx.fillRect(0,0,canvas.width,canvas.height);
		},CAPTURE_INTERVAL); // so at least one blank frame is captured.
	}
	function calibration2() {
		// yay constants
		const DIVIDE_MATRIX    = [[-1,-1],[1,-1],[1,1],[-1,1]], // tl, tr, br, bl
		      CAPTURE_PADDING  = 360, // in milliseconds
		      COLOR_THRESHHOLD = 0.12; // lightness from 0 to 1 in HSL
		
		var centers = [];
		
		// yay function inside a function inside a function
		function paintCanvas(matrixCoords) {
			if (!matrixCoords) { return; }
						
			var width = canvas.width, height = canvas.height;
			
			var x = (width  / 4) + matrixCoords[0] * (width  / 4);
			var y = (height / 4) + matrixCoords[1] * (height / 4);
			
			ctx.clearRect(0, 0, width, height);
			ctx.fillRect(x, y, width/2, height/2);
		}
		
		paintCanvas(DIVIDE_MATRIX[0]);
		setTimeout(function() {
			captureImageSequence(video, cameraDelay + CAPTURE_PADDING, 4,
				function(imageData,i){ // after each capture
			
				var diffImage = imageDiff(imageData, averageImage);
				var diffImage2 = copyImageData(diffImage);
				
				var center = findCenter(diffImage2, COLOR_THRESHHOLD);
				
				imageLog(diffImage,"",center);
				imageLog(diffImage2,"",center);
			
				centers[i] = center;
				
				paintCanvas(DIVIDE_MATRIX[i+1]);
			
			}, function(pixelDatas){ // after all captures
				console.log(centers);
				
				var tl = centers[0],
				    tr = centers[1],
				    br = centers[2],
				    bl = centers[3];
				
				var horiz = findLine(findMidpoint(tl,tr), findMidpoint(bl,br)),
				    verti = findLine(findMidpoint(tl,bl), findMidpoint(tr,br));
				
				var center = findLineIntersect(horiz, verti);
				
				tl[0] += tl[0] - center[0];
				tl[1] += tl[1] - center[1];
				
				tr[0] += tr[0] - center[0];
				tr[1] += tr[1] - center[1];
				
				br[0] += br[0] - center[0];
				br[1] += br[1] - center[1];
				
				bl[0] += bl[0] - center[0];
				bl[1] += bl[1] - center[1];
				
				var scale = output.width / pixelDatas[0].width;
				
				quad.tl = [tl[0] * scale, tl[1] * scale];
				quad.tr = [tr[0] * scale, tr[1] * scale];
				quad.br = [br[0] * scale, br[1] * scale];
				quad.bl = [bl[0] * scale, bl[1] * scale];
				
				stop();
			});
		}, cameraDelay + CAPTURE_PADDING);
	}
	// yay we're done!
	function stop() {
		win.close();
		update_sequences.remove(update);
		alert("done");
	}
	
	
	// ** HELPER FUNCTIONS ** 
	
	function copyImageData(data) {
		var output = ctx.createImageData(data.width,data.height);
		output.data.set(data.data);
		return output;
	}
	
	function fastabs(n){return ((n-1)>>31)?-n:n} // ints only...
	
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
		if (data1.data.length != data2.data.length) {
			throw new RangeError("lengths must be the same");
		}
		var len = data1.data.length,
		    output = ctx.createImageData(data1.width,data1.height); // blank
		
		data1 = data1.data, data2 = data2.data;
		
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
	function findCenter(imageData, colorThreshhold) {
		var arr    = imageData.data,
		    len    = arr.length,
		    width  = imageData.width,
		    height = imageData.height,
		    sumX   = 0,
		    sumY   = 0,
		    count  = 0;
		
		for (var i=0;i<len;i+=4) {
			var lightness = rgbToHsl(arr[i],arr[i+1],arr[i+2])[2];
			
			
				arr[i] = 255 * lightness;
				arr[i+1] = 0;
				arr[i+2] = 0;
			if (lightness >= colorThreshhold) {
			
				var curX = (i/4) % width,
				    curY = ((i/4) - curX) / width;
				
				sumX += curX, sumY += curY;
				
				count++;
			}
		}
		console.log("width",width,"height",height,"count",count,"sumX",sumX,"sumY",sumY);
		return [sumX / count, sumY / count];
	}
	function findLine(point1, point2) {
		// point1 is (x_1, y_1) and point2 is (x_2, y_2)
		
		// (y_2 - y_1) / (x_2 - x_1)
		var slope = (point2[1] - point1[1]) / (point2[0] - point1[0]);
		
		// since y = (m * x) + b
		// then b = y - (m * x)
		var yIntercept = point1[1] - slope * point1[0];
		
		return [slope, yIntercept];
	}
	function findMidpoint(point1, point2) {
		return [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
	}
	function findLineIntersect(line1, line2) {
		// line1 eq is y = m_1 * x + b_1 and line2 eq is y = m_2 * x + b_2
		
		// m_1 * x + b_1 = m_2 * x + b_2
		// x = (b_2 - b_1) / (m_1 - m_2)
		var x = (line2[1] - line1[1]) / (line1[0] - line2[0]);
		
		// y = mx+b
		var y = line1[0] * x + line1[1];
		
		return [x,y];
	}
}
