var http = require("http"), 
    url  = require("url"), 
    path = require("path"), 
    fs   = require("fs"),
    sys  = require("sys");

var formidable = require('formidable'),
    routes     = require('./node.routes'),
    ejs        = require('ejs');

var Util = {};

Util.inArray = function(item, array) { 
    for (var i = 0, len = array.length; i < len; i++) {
        if (array[i] === item) { 
            return true;
        }
    }
    return false;
};

Util.randStr = function() {
    return Math.floor(Math.random() * 2147483648).toString(36) + 
        (Math.floor(Math.random() * 2147483648) ^ 
         (new Date().getTime())).toString(36);
};

var DropUp = (function() {

    var imgTpl = null,
        root   = process.cwd(), 
        ip     = "127.0.0.1", 
        port   = 8124;

    function out(req, res) { 
        routes.route(req, res, [
            ["^/$", function() { serveFile(res, "/index.html"); }],
            ["^/upload$",                  uploadFile],
            ["^/([a-z0-9]{12}.png.html)$", serveImgPage],
            ["^/([a-z0-9]{12}).png$",      serveImg],
            ["([\w\W]*)",                  serveStatic]
        ]);
    };

    function serveStatic(req, res, rest) { 
        serveFile(res, req.url);
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
    
    function serveFile(res, uri) { 
        var filename = path.join(root, "docroot", uri);         
        fs.readFile(filename, "binary", function(err, file) {
    		res.writeHead(200);
    		res.write(file, "binary");
    		res.end();
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
