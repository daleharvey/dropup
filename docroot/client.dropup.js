var DropUp = (function() {
    
    var target = document.getElementById("target");    

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
                
        // TODO
        upload.addEventListener("error", function (error) { }, false);

        xhr.onload = function(event) { 

            $(li).addClass("loaded");

            desc.innerHTML = "<a href='/" + xhr.responseText + ".html'>" + 
                xhr.responseText + "</a>";
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
                $(target).append("<li class='item warning'>1MB Limit</li>");
                continue;
            }

            if (!file.type.match(/image.(png|jpg|jpeg)/)) { 
                $(target).append("<li class='item warning'>Sorry, you can " + 
                                 "only upload png files</li>");
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

    function init() {
        document.addEventListener("dragenter", doNothing, false);  
        document.addEventListener("dragover", doNothing, false);  
        document.addEventListener("drop", drop, false);  
    };

    return {
        "init":init
    };
})();
