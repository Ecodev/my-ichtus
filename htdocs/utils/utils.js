function loadApi(apiServer, filePath, cb) {
    // Create a script tag, set its source
    const scriptTag = document.createElement('script');

    // And listen to it
    if (cb) {
        scriptTag.onload = cb();
    }

    // Make sure this file actually loads instead of a cached version
    const cacheBuster = '?apiServer=' + apiServer + '&time=' + new Date().getTime();

    // Set the type of file and where it can be found
    scriptTag.type = 'text/javascript';
    scriptTag.src = 'https://' + apiServer + filePath + cacheBuster;

    // Finally add it to the <head>
    document.getElementsByTagName('head')[0].appendChild(scriptTag);
}
