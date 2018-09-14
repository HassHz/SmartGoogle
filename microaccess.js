navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream) {
    console.log("Received audio permission");
    window.close();
}).catch(function(err) {
    console.log("Error getting permissions: " + err)
});
