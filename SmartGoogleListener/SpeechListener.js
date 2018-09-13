
	var speechText;
	var action;
	var commands = ["search", "go to"];

	if (!("webkitSpeechRecognition" in window)) {
		console.log("Updated browser to support WebKit Speech Recognition API");
	}
	else {
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
			console.log("Starting event");
		}
		recognition.onresult = function(event){
			
			var searchText = "";
			
			console.log("Event result")
			var interim_transcript = "";
			for (var i = event.resultIndex; i < event.results.length; ++i) {
				if (event.results[i].isFinal) {
				textRecorded += event.results[i][0].transcript;
				} else {
				interim_transcript += event.results[i][0].transcript;
				}
			}
			console.log(textRecorded);
			speechText = textRecorded.split(" ");
			if(speechText.length > 0){
				for(var i = 0; i < commands.length; i++){
					if(commands[i]==speechText[0].toLowerCase()){
						action = speechText[0];
						searchText = speechText.slice(1, speechText.length).join("+");
						speechText[0] = speechText.slice(1, speechText.length).join("");
						
						for(var i = 0; i < speechText.length; i++){
							console.log(speechText[i]);
						}
						recognition.stop();
						break;
					}
				}
				
			}
			console.log(searchText);
			if(searchText!=""){
				window.open("https://www.google.com/search?q="+searchText);
			}
			
			recognition.stop();
		}
		recognition.onend = function(event){
			recognizing = false;
			console.log("Recorded stopped");
		}
		recognition.onerror = function(event){
			console.log("Error");
			console.log(event);
		}
		
	}
	
	function record() {
		console.log(recognizing);
		if (!recognizing) {
			console.log(recognizing);
			console.log("Recorded started");
			recognition.start();
			recognizing = true;
			console.log(recognizing);
		}
	}
