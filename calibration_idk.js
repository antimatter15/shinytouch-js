window.calibration_algorithms || (calibration_algorithms = []);
window.update_sequences || (update_sequences = []);

calibration_algorithms["idk"] = function(win) {
	win.$ = function(d){return win.document.getElementById(d)};
	
	var cont = win.$("container");
	var canvas = document.createElement("canvas");
	
	canvas.width = 640; canvas.height = 480;
	
	canvas.style.border = "1px solid black";
	cont.appendChild(document.createElement("br"));
	cont.appendChild(canvas);
	var ctx = calibration_algorithms["idk"].ctx = canvas.getContext("2d");
	
	update_sequences.push(calibration_algorithms["idk"].update);

}
calibration_algorithms["idk"].update = function(){
}