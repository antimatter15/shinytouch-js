var http = require('http');
var fs = require('fs');

http.createServer(function(req,res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	var url = req.url.replace(/^\/*/,"") || "index3.html";
	// console.log(url);
	if ((/\.\./gm).test(url)) {
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
}).listen(3141, '127.0.0.1');
console.log('Server running at http://localhost:3141/');