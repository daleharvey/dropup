var http = require("http"), 
    url  = require("url"), 
    path = require("path"), 
    fs   = require("fs"),
    sys  = require("sys");

var formidable = require('formidable'),
    routes     = require('./node.routes'),
    ejs        = require('ejs'),
    mime       = require("./mime.js"),
    Util       = require("./util.js").Util;

var DropUp = (function() {

    var imgTpl = null,
        root   = process.cwd(), 
        ip     = "127.0.0.1", 
        port   = 8124;

    function out(req, res) { 
        routes.route(req, res, [
            ["^/$", function() { serveFile(req, res, "/index.html"); }],
            ["^/upload$",                  uploadFile],
            ["^/([a-z0-9]{12}.png.html)$", serveImgPage],
            ["^/([a-z0-9]{12}).png$",      serveImg],
            ["[\w\W]*",                    serveStatic]
        ]);
    };

    function serveStatic(req, res, rest) { 
        serveFile(req, res, req.url);
    };

    function serveImg(req, res) { 
        var filename = path.join(root, "uploads", req.url);         
        fs.readFile(filename, "binary", function(err, file) {
            serveBin(res, file);
    	});
    };
    
    function serveImgPage(req, res, path) {
        path = path.split(".");
        serveBin(res, ejs.render(imgTpl, {
            "locals": { 
                "imgId" : path[0], 
                "imgSrc": path[0] + "." + path[1]
            }
        }));
    };

    function imgExt() { 
        return "png";
    };
    
    function serveBin(res, bin) { 
    	res.writeHead(200);
    	res.write(bin, "binary");
    	res.end();        
    };
    
    function isImage(path) { 
        return true;
    };
    
    function uploadFile(req, res) { 

        var name = Util.randStr() + ".png",
            dest = path.join(root, "uploads", name), 
            content = '';

        req.setEncoding("binary");
        
        req.addListener('data', function(chunk) {
	        content += chunk;
	    });
        
	    req.addListener('end', function() {
            fs.writeFile(dest, content, "binary", function (err) {
	            res.writeHead(200, {'content-type': 'text/plain'});
                res.end(name);
            });
	    });
    };
    
    function serve404(req, res) { 
        res.writeHead(404, {"Content-Type": "text/plain"});
    	res.write("404 Not Found\n");
    	res.end();
    };
    
    function serveFile(req, res, uri) { 
        var filename = path.join(root, "docroot", uri);         
        path.exists(filename, function (exists) {
            if (exists) { 
                fs.readFile(filename, "binary", function(err, file) {
                    var headers = {"Content-Type": mime.lookup(filename)};
    		        res.writeHead(200, headers);
    		        res.write(file, "binary");
    		        res.end();
                });
            } else {
                serve404(req, res);
            }
    	});               
    };
    
    function init() {

        var tpl = path.join(root, "docroot", "img.html");

        fs.readFile(tpl, "binary", function(err, file) {
            imgTpl = file;
        });

        console.log("Starting Server on http://" + ip + ":" + port + "/");
        http.createServer(out).listen(port, ip);        
    };

    return {"init": init};    
})();

DropUp.init();
