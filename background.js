chrome.runtime.onInstalled.addListener(function() {
    console.log("Extension Loaded");
});

// Communication with popup page
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

const search_command = "search";
const open_command = "open";
const goto_command = "go to";

var commands = [
	search_command, 			// Search on google
	open_command,				// Open a website (using Google's "I'm Feeling Lucky") in a new tab
	goto_command				// Navigate to a different website on the same tab (using Google's "I'm Feeling Lucky")
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

		if(textRecorded.length > 0){
			for(var i = 0; i < commands.length; i++){
                if (textRecorded.startsWith(commands[i])) {
					action = commands[i];
                    searchText = textRecorded.substr(commands[i].length + 1).split(" ").join("+");
					recognition.stop();
					break;
				}
			}
		}

		console.log("Action: " + action + "\nAction text: " + searchText);
		console.log(searchText);

		if (action != "" && searchText != ""){
			redirectPage(action, searchText)
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

function redirectPage(command, keyword) {
	if(command != "" && keyword !=""){
		// Google search
		if(command == search_command){
			window.open("https://www.google.com/search?q=" + keyword);
		// Open website in new tab using I'm feeling lucky
		} else if (command == open_command) {
			window.open("https://www.google.com/search?btnI=1&q=" + keyword);
		// Go to website in current tab using I'm feeling lucky
		} else if (command == goto_command) {
			chrome.tabs.update({
				url: "https://www.google.com/search?btnI=1&q=" + keyword
			})
		} else {
			console.log("Unspecified action: " + command);
		}
	}
}
