window.calibration_algorithms || (calibration_algorithms = []);
window.update_sequences || (update_sequences = []);

calibration_algorithms["manual"] = function(win) {
	win.$ = function(d){return win.document.getElementById(d)};
	
	var cont = win.$("container");
	cont.innerHTML = "Clicky clicky the <b id=\"location\"></b> corner of your monitor";
	var loc = win.$("location");
	var canvas = document.createElement("canvas");
	
	canvas.width = 640; canvas.height = 480;
	
	canvas.style.border = "1px solid black";
	cont.appendChild(document.createElement("br"));
	cont.appendChild(canvas);
	var ctx = calibration_algorithms["manual"].ctx = canvas.getContext("2d");
	
	// window.requestAnimationFrame(calibration_algorithms["manual"].update);
	update_sequences.push(calibration_algorithms["manual"].update);
	
	var locs = ["top left","top right","bottom right","bottom left"];
	loc.innerHTML = locs[0];
	var pos = 0;
	ctx.strokeStyle = "#FF0000";
	canvas.onclick = function(e) {
		var x,y;
		if (e.pageX && e.pageY) { 
			x = e.pageX;
			y = e.pageY;
		} else { 
			x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
			y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
		}
		x -= canvas.offsetLeft;
		y -= canvas.offsetTop;
		
		x /= 2, y /= 2; // make 320x240
		
		if (pos < locs.length - 1) {
			// if              2          1    0
			quad[(pos&&pos-1)?"br":(pos)?"tr":"tl"] = [x, y];
			
			loc.innerHTML = locs[++pos];
		} else { // if 3
			quad["bl"] = [x, y];
			// done
			loc.innerHTML = "nothing";
			cont.appendChild(document.createElement("br"));
			
			// cancel update thing
			// or not, who cares?
			// yes i care
			// update_sequences.splice(update_sequences.indexOf(calibration_algorithms["manual"].update),1);
			
			var b = document.createElement("b");
			b.appendChild(document.createTextNode("You can\/should close the window now."));
			cont.appendChild(b);
			
			calculateQuad();
		}
		
		// ctx.strokeRect(x-10, y-10, 20, 20);
		
	}
}
calibration_algorithms["manual"].update = function(){
	var ctx = calibration_algorithms["manual"].ctx;
	
	/*
	ctx.drawImage(video,0,0);
	for (var i in quad) {
		if (quad[i] != null) {
			ctx.strokeRect(quad[i][0] - 10, quad[i][1] - 10, 20, 20);
		}
	}
	*/
	
	// be cheap and copy off the other one to save processing
	ctx.drawImage(output,0,0,640,480);
}