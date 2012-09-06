window.calibration_algorithms || (calibration_algorithms = {});
window.update_sequences || (update_sequences = []);

calibration_algorithms["manual"] = function(win) {
	
	function update() {
		// uhh we have ctx in this scope right?
		// var ctx = calibration_algorithms["manual"].ctx;
		
		// be cheap and copy off the other one to save processing
		ctx.drawImage(output,0,0,canvas.width,canvas.height);
	}
	
	/////////////////////////////////////////////////////////////
	calibration_options = {
		screen_width: screen.width,
		screen_height: screen.height,
		current_algorithm : "manual"
	}
	
	
	win.$ = function(d){return win.document.getElementById(d)};
	
	var cont = win.$("message");
	cont.innerHTML = "Clicky clicky the <b id=\"location\"></b> corner of your monitor";
	var loc = win.$("location");
	var canvas = document.createElement("canvas");
	
	canvas.width = 640; canvas.height = 480;
	
	canvas.style.border = "1px solid black";
	canvas.style.marginTop = "20px";
	cont.appendChild(document.createElement("br"));
	cont.appendChild(canvas);
	
	var ctx = canvas.getContext("2d");
	ctx.strokeStyle = "#FF0000";
	// ctx.lineCap = "";
	// ctx.lineJoin = "";
	
	update_sequences.push(update);
	
	var locs = ["top left","top right","bottom right","bottom left"];
	loc.innerHTML = locs[0];
	var pos = 0;
	
	canvas.onclick = function(e) {
		// woah it's magical built in goodness
		var x = e.offsetX,
		    y = e.offsetY;
		
		var scale = output.width / canvas.width;
		x *= scale, y *= scale; // make sure coordinates scale
		
		if (pos < locs.length - 1) {
			// if              2          1    0
			quad[(pos&&pos-1)?"br":(pos)?"tr":"tl"] = [x, y];
			
			loc.innerHTML = locs[++pos];
		} else { // if 3
			quad["bl"] = [x, y];
			// done
			stop();
		}
		
	}
	function stop() {
		loc.innerHTML = "nothing";
		cont.appendChild(document.createElement("br"));
		
		// cancel update thing
		// or not, who cares?
		// yes i care
		update_sequences.remove(update);
		
		//var b = document.createElement("b");
		//b.appendChild(document.createTextNode("You can\/should close the window now."));
		//cont.appendChild(b);
		
		canvas.onclick = null;
		win.close();
		
		calculateQuad();
	}
}
