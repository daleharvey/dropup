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
        xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
        xhr.sendAsBinary(bin)
    };

    function fileLoaded(event) { 

        var li                  = document.createElement('li'),
            div                 = document.createElement('div'),
            img                 = document.createElement('img'),
            loading             = document.createElement('div'),
            progress            = document.createElement('div'),
            desc                = document.createElement('p'),
            file                = event.target.file,
            getBinaryDataReader = new FileReader();

        li.className      = "item";
        progress.className = "progress";
        loading.className = "loading";
        div.className     = "wrapper";
        desc.className = "desc";        
        desc.innerHTML = "uploading...";

        img.src = event.target.result;
        div.appendChild(img);
        li.appendChild(div);
        li.appendChild(loading);
        li.appendChild(desc);
        loading.appendChild(progress);              
        target.appendChild(li);

        progress.style.width = "0%";
        
        getBinaryDataReader.addEventListener("loadend", function(evt) {
            startUpload(file, evt.target.result, li, desc, progress);
        }, false);
        getBinaryDataReader.readAsBinaryString(file);
    };
    
    function drop(e) { 

        var i, len, files, file;

        e.stopPropagation();  
        e.preventDefault();  

        files = e.dataTransfer.files;  

        for (i = 0; i < files.length; i++) {
            
            file = files[i];

            if (file.size > 1048576) {
                $(target).append("<li class='item error'><p class='error'>" +
                                 "1MB Limit</li></p>");
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
            
            reader.addEventListener("loadend", fileLoaded, false);
            reader.readAsDataURL(file);
        }
    };

    function doNothing(e) {  
        e.stopPropagation();  
        e.preventDefault();  
    };

    function displayStored() {
        var i, len, html = "";
        for (i = 0, len = stored.length; i < len; i += 1) {
            path = stored[i].path;
            html += '<li class="item loaded"><div class="wrapper">' + 
                '<img src="/' + path + '" /></div><p class="desc">' +
                '<a href="/' + path + '.html">' + path + '</a>' +
                '<a class="remove" data-path="' + path + 
                '">remove</a></p></li>';
        }
        target.innerHTML = html;
    };

    function removeClicked(e) { 
        if (e.target.className === "remove") { 
            removeFromStorage(e.target.getAttribute("data-path"));
            displayStored();
        }
    };

    function init() {

        expireStored();        
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
