var http = require('http');
var fs = require('fs');
var port = (function() {
	var args = process.argv.slice(2);
	
	for (var i=0;i<args.length;i++) {
		var params = args[i].split("=",2);
		if ((/-{0,2}port/i).test(params[0])) {
			return params[1];
		}
	}
}());
port = parseInt(port);
if (0 <= port && port <= 65535) {}
else {
	port = 8080;
}

http.createServer(function(req,res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	var url = req.url.replace(/^\/*/,"") || "index3.html";
	// console.log(url);
	if (!(/([a-z0-9-.]+\/?)*/i).test(url)) {
		res.end("STAWP");
	} else {
		try {
			var body = fs.readFileSync(url,'UTF-8');
			res.write(body);
			res.end();
		} catch(e) {
			res.end("Error!!!");
		}
	}
}).listen(port, '127.0.0.1');
console.log('Server running at http://localhost:'+port);
