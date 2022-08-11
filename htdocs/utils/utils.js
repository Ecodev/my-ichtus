function loadJs(filePath, cb) {
    // Create a script tag, set its source
    var scriptTag = document.createElement("script");

    // And listen to it
    if (cb) {
        scriptTag.onload = cb();
    }

    // Make sure this file actually loads instead of a cached version
    var cacheBuster = "?time=" + new Date().getTime();

    // Set the type of file and where it can be found
    scriptTag.type = "text/javascript";
    scriptTag.src = filePath + cacheBuster;

    // Finally add it to the <head>
    document.getElementsByTagName("head")[0].appendChild(scriptTag);
}
