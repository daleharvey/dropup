var DropUp = (function() {
    
    var stored = localStorage.stored && JSON.parse(localStorage.stored) || [],
        target = document.getElementById("target");    

    function addToStorage(img) { 
        stored.push({"path":img, "date":(new Date())});
        localStorage.stored = JSON.stringify(stored);
    };

    function removeFromStorage(path) { 
        var i, len, tmp = [];
        for (i = 0, len = stored.length; i < len; i += 1) {
            if (stored[i].path !== path) {
                tmp.push(stored[i]);
            }
        }
        stored = tmp;
        localStorage.stored = JSON.stringify(stored);
    };

    function expireStored() {
        var i, len, now = new Date().getTime(), tmp = [];
        for (i = 0, len = stored.length; i < len; i += 1) {
            var time = new Date(stored[i].date).getTime();
            if ((now - time) < 86400000) { 
                tmp.push(stored[i]);
            }
        }
        stored = tmp;
        localStorage.stored = JSON.stringify(stored);
    };

    function startUpload(file, bin, li, desc, progress) {

        var xhr    = new XMLHttpRequest(),
            upload = xhr.upload;
        
        upload.addEventListener("progress", function(e) {
            if (e.lengthComputable) {
                var percentage = Math.round((e.loaded * 100) / e.total);
                if (percentage < 100) {
                    progress.style.width = percentage + "px";
                }
            }
        }, false);
                
        xhr.onload = function(event) { 
            
            if (xhr.status === 200) { 

                $(li).addClass("loaded");
                $(li).find(".wrapper a")
                    .attr("href", xhr.responseText + ".html");

                desc.innerHTML = 
                    "<a href='/" + xhr.responseText + ".html'>" + 
                    xhr.responseText + "</a>" + 
                    "<a class='remove' data-path='" + xhr.responseText + 
                    "'>remove</a>";

                addToStorage(xhr.responseText);

            } else { 
                $(li).find(".loading").remove();
                $(desc).addClass("error")
                    .text("There was a problem uploading your file");
            }
        };        
      
        xhr.open("POST", "/upload");

        xhr.setRequestHeader('Content-Type', 'multipart/form-data');
        xhr.setRequestHeader('X-File-Name', file.fileName);
        xhr.setRequestHeader('X-File-Size', file.fileSize);
        xhr.setRequestHeader('X-File-Type', file.type); //add additional header
        xhr.send(file);

        //xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
        //xhr.sendAsBinary(bin)
    };

    function fileLoaded(event) { 

        var $li                 = $(generateLi("")),
            file                = event.target.file,
            getBinaryDataReader = new FileReader(); 

        var li       = $li.get(0), 
            desc     = $li.find(".desc").get(0), 
            progress = $li.find(".progress").get(0);

        $li.find("img").attr("src", event.target.result);
        progress.style.width = "0%";

        $(target).append($li);

        var f = function(evt) {
            startUpload(file, evt.target.result, li, desc, progress);
        };
        
        if (!hasStupidChromeBug()) {
            getBinaryDataReader.addEventListener("loadend", f, false);
        } else {
            getBinaryDataReader.onload = f;
        }

        getBinaryDataReader.readAsBinaryString(file);
    };
    
    function drop(e) { 

        var i, len, files, file;

        e.stopPropagation();  
        e.preventDefault();  

        files = e.dataTransfer.files;  

        for (i = 0; i < files.length; i++) {
            
            file = files[i];

            if (file.size > (1048576 * 5)) {
                $(target).append("<li class='item'><p class='error'>" +
                                 "5MB Limit</li></p>");
                continue;
            }

            if (!file.type.match(/image.(png|jpg|jpeg)/)) { 
                $(target).append("<li class='item'><p class='error'>Sorry, " +
                                 "you can only upload png and jpg files" +
                                 "</p></li>");
                continue;
            }

            reader = new FileReader();
            reader.index = i;
            reader.file = file;
            
            if (!hasStupidChromeBug()) {
                reader.addEventListener("loadend", fileLoaded, false);
            } else {
                reader.onload = fileLoaded;
            }
            //reader.addEventListener("loadend", fileLoaded, false);
            reader.readAsDataURL(file);
        }
    };

    function hasStupidChromeBug() { 
        return typeof(FileReader.prototype.addEventListener) !== "function";
    };

    function generateLi(path) {

        var loadText  = path ? path : "Uploading ...",
            loadClass = path ? "loaded" : "",
            imgSrc    = path ? "src=\"/" + path + "\"": "",
            imgHref   = path ? "href=\"/" + path + "\"": "",
            imgHtml   = path ? "href=\"/" + path + ".html\"" : "";

        return '<li class="item ' + loadClass + '">' + 
            '<div class="wrapper">' + 
            '<a ' + imgHtml + '><img ' + imgSrc + ' />' + '</a></div>' + 
            '<div class="loading"><div class="progress"></div></div>' +
            '<p class="desc"><a ' + imgHtml + '>' + loadText + '</a>' + 
            '<a class="remove" data-path="' + path + '">remove</a></p></li>';
    };

    function doNothing(e) {  
        e.stopPropagation();  
        e.preventDefault();  
    };

    function displayStored() {
        var i, len, html = "";
        for (i = 0, len = stored.length; i < len; i += 1) {
            path = stored[i].path;
            html += generateLi(path);
        }
        target.innerHTML = html;
    };

    function removeClicked(e) { 
        if (e.target.className === "remove") { 
            removeFromStorage(e.target.getAttribute("data-path"));
            $(e.target).parents(".item").fadeOut("medium", function() {
                $(this).remove();
            });
        }
    };

    function init() {

        //expireStored();        
        displayStored();
        
        target.addEventListener("mousedown", removeClicked, false);  

        document.addEventListener("dragenter", doNothing, false);  
        document.addEventListener("dragover", doNothing, false);  
        document.addEventListener("drop", drop, false);  
    };

    return {
        "init":init
    };
})();
