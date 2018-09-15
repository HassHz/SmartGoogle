chrome.runtime.onInstalled.addListener(function() {
    console.log("Extension Loaded");
});

// Communication with background page
chrome.extension.onConnect.addListener(function(port) {
    console.log("Connected to popup");
    port.onMessage.addListener(function(msg) {
        console.log("Message received from popup: "+ msg);
        if (msg == "record") {
            record();
        }
    });
});

var speechText;
var action;
var commands = [
	"search", 			// Search on google
	"open",				// Open a website (using Google's "I'm Feeling Lucky") in a new tab
	"go to"				// Navigate to a different website on the same tab (using Google's "I'm Feeling Lucky")
];

if (!("webkitSpeechRecognition" in window)) {
	console.log("Browser does not support WebKit Speech Recognition API");
} else {
	console.log("Initializing Speech Recognition");
	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = false;
	var recognizing = false;
	var textRecorded = "";

	recognition.onstart = function(event) {
		speechText = [];
		action = "";
		textRecorded = "";
		console.log(event);
		console.log("Speech recognition event started");
	}

	recognition.onresult = function(event){
		console.log("Speech recognition event result received: ");
		console.log(event);

		var searchText = "";
		var interim_transcript = "";
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				textRecorded += event.results[i][0].transcript;
			} else {
				interim_transcript += event.results[i][0].transcript;
			}
		}
		console.log("Recorded text: " + textRecorded);

		speechText = textRecorded.split(" ");
		if(speechText.length > 0){
			for(var i = 0; i < commands.length; i++){
				if(commands[i] == speechText[0].toLowerCase()){
					action = commands[i];
					searchText = speechText.slice(1, speechText.length).join("+");
					recognition.stop();
					break;
				} else if (textRecorded.startsWith(commands[i])) {
					action = commands[i];
					searchText = speechText.slice(2, speechText.length).join("+");
					recognition.stop();
					break;
				}
			}
		}

		console.log("Action: " + action + "\nAction text: " + searchText);
		console.log(searchText);

		// Google search
		if(action == "search" && searchText != ""){
			window.open("https://www.google.com/search?q=" + searchText);
		// Open website in new tab using I'm feeling lucky
		} else if (action == "open" && searchText != "") {
			window.open("https://www.google.com/search?btnI=1&q=" + searchText);
		// Go to website in current tab using I'm feeling lucky
		} else if (action == "go to" && searchText != "") {
			chrome.tabs.update({
				url: "https://www.google.com/search?btnI=1&q=" + searchText
			})
		} else if (action != ""){
			console.log("Unspecified action: " + action);
		}

		recognition.stop();
	}

	recognition.onend = function(event){
		recognizing = false;
		console.log("Recording stopped");
	}

	recognition.onerror = function(event){
		console.log("Error");
		console.log(event);
        if (event.error == "not-allowed") {
            chrome.tabs.create({url: chrome.extension.getURL('microaccess.html')});
        }
        record();
	}
}

function record() {
	if (!recognizing) {
		console.log("Recording started...");
		recognition.start();
		recognizing = true;
	}
}
