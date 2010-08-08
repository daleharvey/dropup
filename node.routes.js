
var sys = require('sys');
var parseURL = require('url').parse;

var route = function(req, res, urls, passed_args){
    for (var i=0;i<urls.length;i++){
        var args = new RegExp(urls[i][0]).exec(parseURL(req.url).pathname);
        if (args !== null){
            args.shift();
            args.unshift(req, res);
            if (typeof passed_args == 'array')
                args.concat(passed_args);
            urls[i][1].apply(this, args);
            break;
        }
    }
};

var include = function(urls){
    return function(req, res){
        route(req, res, urls, Array.prototype.slice.call(arguments, 2));
    };
};

exports.route = route;
exports.include = include


