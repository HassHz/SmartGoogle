var port = chrome.extension.connect({
	name: "PopupBgCommunication"
});

port.onMessage.addListener(function(msg) {
	console.log("Received message from background: " + msg);
});

function sendRecordMessage() {
	port.postMessage("record");
}

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('microphone').addEventListener('click', sendRecordMessage);
});
