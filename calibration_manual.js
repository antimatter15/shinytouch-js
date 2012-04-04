if (typeof calibration_algorithms=="undefined") {
	var calibration_algorithms = [];
}

calibration_algorithms["manual"] = function(win) {
	win.$ = function(d){return win.document.getElementById(d)};
	
	var cont = win.$("container");
	cont.innerHTML = "";
	var canvas = document.createElement("canvas");
	canvas.width = 640; canvas.height = 480;
	canvas.style.border = "1px solid black";
	cont.appendChild(canvas);
	calibration_algorithms["manual"].ctx = canvas.getContext("2d");
	window.requestAnimationFrame(calibration_algorithms["manual"].update);
}
calibration_algorithms["manual"].update = function(){
	calibration_algorithms["manual"].ctx.drawImage(video,0,0);
	window.requestAnimationFrame(calibration_algorithms["manual"].update);
}