//List of user's songs
var songsList =[];

//Array used to store recordings either just recorded by user,
//or loaded from their saved songs list
var recordingArray = [];

//Array used when user reverses their song in recordingArray
var reversedRecordingArray = [];

//boolean if piano is connected
var deviceConnected;

//map of keyboard key and note/number values
var keyMap;

//keyboard map for QWERTY keyboard playing feature
var keyboardMap;

// boolean is user is logged in
var userLoggedIn;
checkUserLoggedIn();

//Input from MIDI device
var input;

//Output from MIDI device
var output;

//boolean to show if app is recording (pushing to recordingArray) or not
var isRecording = false;

//Red recording flashing icon
var icon = document.getElementById("icon");

//List of notes and note numbers for reference
var notesList = [];
createNoteList(notesList);

//Input connections dropdown on index.html
var inputConnections = document.getElementById("input-connections");

//Output connections dropdown on index.html
var outputConnections = document.getElementById("output-connections");

//Alert textbox used throughout webapp for notifying user
var alertTextbox = document.getElementById("alert-textbox");

//Sliders, slider containers and current slider values on index.html
var octaveSlider = document.getElementById("octave-slider");
var transposeSlider = document.getElementById("transpose-slider");
var speedSlider = document.getElementById("speed-slider");
var velocitySlider = document.getElementById("velocity-slider");
var currentOctave = 0;
var currentKey = 0;
var currentSpeed = 1;
var currentVelocity = 0;
var currentOctaveContainer = document.getElementById("current-octave");
var currentKeyContainer = document.getElementById("current-key");
var currentSpeedContainer = document.getElementById("current-speed");
var currentVelocityContainer = document.getElementById("current-velocity");

//Button to save desired recording
var saveRecordingButton = document.getElementById("save-recording");

//Input box for name of song
var songNameInput = document.getElementById("song-name-input");

//Current token variable
var currentToken = localStorage.getItem("token");

//Toggle boolean for onscreen audio
var onscreenKeyboardAudio = true;

//Selected piano setting for sound
var selectedPreset=_tone_0000_Aspirin_sf2_file;
var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContextFunc();
var player=new WebAudioFontPlayer();
player.adjustPreset(audioContext,selectedPreset);

//Plays note through computer
function startWaveTableNow(pitch) {
    if(onscreenKeyboardAudio){
        player.queueWaveTable(audioContext, audioContext.destination, selectedPreset, audioContext.currentTime + 0, pitch, 1.0);
    }
}

//Function ensures correct links are displayed in navbar
//Logged in users will hide 'register' and 'login' etc
function checkUserLoggedIn(){
    var loggedIn = document.getElementById('logged-in-p');
    var myAccount = document.getElementById('my-account-a');
    var logout = document.getElementById('logout-a');
    var register = document.getElementById('register-a');
    var login = document.getElementById('login-a');
    var savedSongsDiv = document.getElementById('saved-songs-div');
    $.ajax({
        method: 'GET',
        url: '/user/session',
        headers: {
            'X-Token' : localStorage.getItem('token')
        },
        success: function(data){
            if(data['token'] != null){
                console.log(data);
                userLoggedIn = true;
                console.log(userLoggedIn);
                console.log("User is logged in");
                loggedIn.style.display = 'block';
                myAccount.style.display = 'block';
                logout.style.display = 'block';
                register.style.display = 'none';
                login.style.display = 'none';
                savedSongsDiv.style.display = 'block';
                saveRecordingButton.style.display = 'inline';
                songNameInput.style.display = 'inline';
            } else {
                userLoggedIn = false;
                console.log(userLoggedIn);
                console.log("User is not logged in");
                loggedIn.style.display = 'none';
                myAccount.style.display = 'none';
                logout.style.display = 'none';
                register.style.display = 'block';
                login.style.display = 'block';
                savedSongsDiv.style.display = 'none';
                saveRecordingButton.style.display = 'none';
                songNameInput.style.display = 'none';
            }
        },
    });

    return userLoggedIn;
}

//Functions for ensuring sliders are implemented correctly
//Octave, key, speed and velocity sliders will change accordingly
currentOctaveContainer.innerHTML = octaveSlider.value;
octaveSlider.oninput = function() {
    currentOctaveContainer.innerHTML = this.value;
    var octave = parseInt(this.value);
    if(recordingArray.length > 0){
        console.log("Current octave is " + currentOctave);
        console.log("Desired octave is " + octave);
        console.log("Octave needs to change by " + (octave - currentOctave));
        changeTune((octave - currentOctave)*12);
        console.log(this.value);
        console.log(currentOctave);
        console.log("Above 2 values should be equal");
        currentOctave = recordingArray[0].note.octave;
        findCurrentOctave();
    }
}

currentKeyContainer.innerHTML = transposeSlider.value;
transposeSlider.oninput = function() {
    var key = parseInt(this.value);
    if(recordingArray.length > 0){
        changeTune(key - currentKey);
        currentKey = this.value;
    }
    currentKeyContainer.innerHTML = this.value;
}

currentSpeedContainer.innerHTML = speedSlider.value;
speedSlider.oninput = function() {
    var speed = parseFloat(this.value);
    if(recordingArray.length > 0){
        changeSpeed(1 + speed - currentSpeed);
        currentSpeed = this.value;
    }
    currentSpeedContainer.innerHTML = this.value;
}

currentVelocityContainer.innerHTML = velocitySlider.value;
velocitySlider.oninput = function() {
    var velocity = parseFloat(this.value);
    if(recordingArray.length > 0){
        changeVelocity(velocity);
        currentVelocity = this.value;
    }
    currentVelocityContainer.innerHTML = this.value;
}


//Enables connectivity between piano and computer
WebMidi.enable(function () {

    setKeyMap();

    setupConnection();


    document.getElementById('playback').addEventListener('click', function() {playback("device")});
    document.getElementById('onscreen-keyboard-playback').addEventListener('click', function() {playback("onscreen-keyboard")});
    document.getElementById('start-recording').addEventListener('click', startRecording);
    document.getElementById('stop-recording').addEventListener('click', stopRecording);
    document.getElementById('clear-recording').addEventListener('click', clearRecording);
    document.getElementById('reverse-recording').addEventListener('click', function() {reverseRecording()});
    document.getElementById('onscreen-keyboard-audio-toggle').addEventListener('click', onscreenKeyboardAudioToggle);
    document.getElementById('save-recording').addEventListener('click', function() {saveRecording(songNameInput.value)});
    document.getElementById('download-recording').addEventListener('click', function() {downloadRecording()});
    document.addEventListener('keypress', keyboardListener);

});

//Function checks the octave of a song after it's finished recording and changes the onscreen slider accordingly
function findCurrentOctave(){
    if(recordingArray.length > 0){
        for (let i = 0; i < recordingArray.length; i++) {
            var currentEvent = recordingArray[i];
            if(currentEvent.type === "noteon"){
                currentOctave = currentEvent.note.octave;
                break;
            }
        }
    } else {
        currentOctave = 0;
    }
    octaveSlider.value = currentOctave;
    currentOctaveContainer.innerHTML = octaveSlider.value;
}

//Function checks the velocity of a song after it's finished recording and changes the onscreen slider accordingly
function findCurrentVelocity(){
    if(recordingArray.length > 0){
        for (let i = 0; i < recordingArray.length; i++) {
            var currentEvent = recordingArray[i];
            if(currentEvent.type === "noteon"){
                currentVelocity = currentEvent.velocity;
                break;
            }
        }
    } else {
        currentVelocity = 0;
    }
    velocitySlider.value = currentVelocity;
    currentVelocityContainer.innerHTML = velocitySlider.value;
}

//Note list is created when the page loads
//Reference for note numbers and note keys/octaves
function createNoteList(notesList){
    var noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    for (var i = 0; i < 11; i++){
        for (var j = 0; j < noteNames.length; j++){
            notesList.push({
                "noteName" : noteNames[j],
                "octave" : i
            });
        }
    }
    for (var i = 0; i <= 3; i++){
        notesList.pop();
    }
}

//Function for connecting a new device to the application
//Called when user clicks 'connect'
function setupConnection(){
    var inputSelect = document.getElementById("input-connections");
    var outputSelect = document.getElementById("output-connections");
    for (var i = 0; i < WebMidi.inputs.length; i++){
        var option = document.createElement("option");
        var optionText = WebMidi.inputs[i]._midiInput.manufacturer;
        option.text = optionText;
        inputSelect.add(option);
    }
    for (var i = 0; i < WebMidi.outputs.length; i++){
        var option = document.createElement("option");
        var optionText = WebMidi.outputs[i]._midiOutput.manufacturer;
        option.text = optionText;
        outputSelect.add(option);
    }
    if(WebMidi.inputs.length > 0){
        input = WebMidi.inputs[0];
        deviceConnected = true;
    }
    if(WebMidi.outputs.length > 0){
        output = WebMidi.outputs[0];
        deviceConnected = true;
    }

    if(input != null){
        input.addListener('noteon', "all", function(e) {noteOn(e, recordingArray, isRecording)});
        input.addListener('noteoff', "all", function(e) {noteOff (e, recordingArray, isRecording)});
        input.addListener('controlchange', "all", function (e) {
            if(isRecording){
                console.log("Received 'controlchange' message.", e);
                recordingArray.push(e);
            }
        });
    }

    displayConnections();
}

//Function for correctly displaying the connected piano name
function displayConnections(){

    if(input != null){
        document.getElementById("connected-input").innerHTML = input.manufacturer +  " " + input.name;
    } else {
        document.getElementById("connected-input").innerHTML = "No device connected";
    }

    if(output != null){
        document.getElementById("connected-output").innerHTML = output.manufacturer +  " " + output.name;
    } else {
        document.getElementById("connected-output").innerHTML = "No device connected";
    }
}

function deviceConnection(){

    if(inputConnections.options.selectedIndex == 0 || outputConnections.options.selectedIndex == 0){
        return;
    }
    input = WebMidi.inputs[inputConnections.options.selectedIndex-1];
    output = WebMidi.outputs[outputConnections.options.selectedIndex-1];
    document.getElementById("connected-input").innerHTML = input.manufacturer +  " " + input.name;
    document.getElementById("connected-output").innerHTML = output.manufacturer +  " " + output.name;
    deviceConnected = true;

    displayConnections();

}

function deviceDisconnection(){

    input = null;
    output = null;

    var inputOutputConnections = [inputConnections, outputConnections];

    for (var i = 0; i < inputOutputConnections.length; i++){
        var currentSelection = inputOutputConnections[i];
        for (var j = 0; j < currentSelection.options.length; j++){
            if (currentSelection.options[j].value === "default"){
                currentSelection.selectedIndex = currentSelection.options[j];
            }
        }
    }
    deviceConnected = false;

    displayConnections();

}

//Currently unused function
//Used for logging midi events as they come into the app
function showLog(){
    for (var i = 0; i < recordingArray.length; i ++){
        var event = recordingArray[i];
        if(event.type == "noteon"){
            console.log(event.note.name + event.note.octave + ", " + event.type + " @ velocity " + event.velocity + ", time: " + event.timestamp);
        } else if (event.type == "noteoff"){
            console.log(event.note.name + event.note.octave + ", " + event.type + ", time: " + event.timestamp);
            console.log("This note finished at " + event.timestamp);
        } else if (event.controller.name == "holdpedal"){
            if(event.value < 64){
                console.log("Sustain pedal depressed");
            } else {
                console.log("Sustain pedal pressed");
            }
        } else {
            console.log("Unrecognised event logged");
        }
    }
}

//Function wipes recordingArray clean for new recording
//Calls clearOtherSelectTabs to reset dropdowns to defaults
function startRecording(){
    alertTextbox.innerHTML = "Recording will begin when you start playing";
    console.log("Recording starting...");
    isRecording = true;
    recordingArray = [];
    clearOtherSelectTabs("n/a");
}

//Stops red recording icon
//Changed alertBox to show recording has ceased
//Calls functions to insert new values into sliders on screen
function stopRecording(){
    if(isRecording){
        isRecording = false;
        console.log("Recording stopped");
        icon.style.visibility = "hidden";
        alertTextbox.innerHTML = "Recording stopped. Click 'Play' to listen, or use buttons to edit";
        setTimeout(function(){
            alertTextbox.innerHTML = "";
        }, 4000);
    } else {
        alertTextbox.innerHTML = "Device is not being recorded. Click 'Start Recording to begin, or 'Play' to listen";
        setTimeout(function(){
            alertTextbox.innerHTML = "";
        }, 4000);
    }
    findCurrentOctave();
    findCurrentVelocity();
    console.log(recordingArray);
    clearOtherSelectTabs();
}

//Allows user to turn onscreen audio on or off
function onscreenKeyboardAudioToggle(){
    if(onscreenKeyboardAudio){
        document.getElementById('onscreen-keyboard-audio-toggle').value = 'On Screen Audio: Off';
        onscreenKeyboardAudio = false;
    } else {
        document.getElementById('onscreen-keyboard-audio-toggle').value = 'On Screen Audio: On';
        onscreenKeyboardAudio = true;
    }
}

//Tied to listener to recognise incoming notes
//Depending on settings, can play sound as notes come in
function noteOn(event, recordingArray, isRecording){
    if(deviceConnected){
        console.log("noteOn function called");
        console.log(event);
        if(isRecording){
            alertTextbox.innerHTML = "Recording";
            icon.style.visibility = "visible";
            logMidiMessage(event);
            recordingArray.push(event);
            console.log("Array now contains " + recordingArray.length + " events.");
        }
        var note = event.note.name + event.note.octave;
        var substring = "#";
        console.log(note + " pressed at " + event.velocity);
        if(onscreenKeyboardAudio){
            startWaveTableNow(event.note.number);
        }
        if(note.indexOf(substring) !== -1){
            var topId = document.getElementById(note + "-top");
            topId.style.backgroundColor = "red";
        } else {
            var topId = document.getElementById(note + "-top");
            var bottomId = document.getElementById(note + "-bottom");
            topId.style.backgroundColor = "red";
            bottomId.style.backgroundColor = "red";
        }
    }
}

//Keyboard map to mirror structure of piano on QWERTY keyboard
function setKeyMap(){
    keyMap = new Map();
    keyboardMap = ['KeyZ', 'KeyS', 'KeyX', 'KeyD', 'KeyC', 'KeyV', 'KeyG', 'KeyB', 'KeyH', 'KeyN', 'KeyJ',
    'KeyM', 'KeyQ', 'Digit2', 'KeyW', 'Digit3', 'KeyE', 'KeyR', 'Digit5', 'KeyT', 'Digit6', 'KeyY', 'Digit7',
    'KeyU', 'KeyI', 'Digit9', 'KeyO', 'Digit0', 'KeyP', 'BracketLeft', 'Equal', 'BracketRight'];
    for (var i = 48; i < 80; i++){
        keyMap.set(keyboardMap[i-48], i);
    }
}

//Keyboard listener function
//If user is typing a song name into text box the function won't run through
//Otherwise corresponding key will sound and onboard piano will change colour
function keyboardListener(key){
    if(songNameInput === document.activeElement){
        return;
    }
    console.log("Keyboard listener");
    try{
        var note = keyMap.get(key.code);
        startWaveTableNow(note);
        keyColourChange(note);
    } catch (error){
    }
}

//All sliders are reset to default
function resetSliders(){
    currentKey = 0;
    findCurrentOctave();
    transposeSlider.value = 0;
    currentKeyContainer.innerHTML = "0";
    currentSpeed = 1;
    speedSlider.value = 1;
    currentSpeedContainer.innerHTML = "1";
}

//When user chooses a new song/scale/chord from a different drop down
//The other dropdowns will return to default, i.e. blank
//Also used when user chooses to record, all dropdowns go blank
function clearOtherSelectTabs(selectedOption){
    resetSliders();
    var options = ["major-chord", "minor-chord", "major-scale", "minor-scale", "saved-songs"];
    for (var i=0; i<options.length; i++){
        var currentSelection = document.getElementById(options[i]);
        if(currentSelection.id !== selectedOption){
            var opts = currentSelection.options;
            for(var j = 0; j < opts.length; j++){
                if(opts[j].value === "default"){
                    opts.selectedIndex = j;
                }
            }
        }
    }
}

//Connects to dropdown for major and minor scales
//Takes value of key and calls playScale function with parameter
//depending on which type is called
function scaleSelect(type){
    var scaleSelect = document.getElementById(type);
    var currentSelection = scaleSelect.options[scaleSelect.selectedIndex].value;
    var type = scaleSelect.id;
    alertTextbox.innerHTML = scaleSelect.options[scaleSelect.selectedIndex].text;
    console.log(type);
    playScale(currentSelection, type);
}

//Plays scale
//major or minor will use different arrays to jump
//appropriate amount of steps in between each key
function playScale(selection, type){
    var number = parseInt(selection, 10);
    console.log(number + " " + type);
    var majorSteps = [2, 2, 1, 2, 2, 2, 1];
    var minorSteps = [2, 1, 2, 2, 1, 2, 2];
    var timestamp = 0;
    recordingArray = [];
    for (i = 0; i<8; i++){
        recordingArray.push({
            "type" : "noteon",
            "timestamp" : timestamp,
            "channel" : 1,
            "note" : {
                "number" : number,
                "name" : notesList[number].noteName,
                "octave" : notesList[number].octave
            },
            "velocity" : .5
        });
        timestamp += 500;
        recordingArray.push({
            "type" : "noteoff",
            "timestamp" : timestamp,
            "channel" : 1,
            "note" : {
                "number" : number,
                "name" : notesList[number].noteName,
                "octave" : notesList[number].octave
            },
            "velocity" : 0
        });
        if(type === "major-scale"){
            number += majorSteps[i];
        } else if (type === "minor-scale"){
            number += minorSteps[i];
        } else {
            console.log("Error in reaching next note of scale");
        }
    }
    console.log(recordingArray);
    currentOctave = recordingArray[0].note.octave;
    console.log("Current octave is " + currentOctave);
    playback("onscreen-keyboard");
    clearOtherSelectTabs(type);
}

//Connects to dropdown for major and minor chords
//Takes value of key and calls playChord function with parameter
//depending on which type is called
function chordSelect(type){
    var chordSelect = document.getElementById(type);
    var currentSelection = chordSelect.options[chordSelect.selectedIndex].value;
    alertTextbox.innerHTML = chordSelect.options[chordSelect.selectedIndex].text;
    var type = chordSelect.id;
    console.log(type);
    playChord(currentSelection, type);
}

//Plays chord
//major or minor will use different arrays to jump
//appropriate amount of steps in between each key
function playChord(selection, type){
    var number = parseInt(selection, 10);
    recordingArray = [];
    var timestamp = 0;
    var chordArray;
    if(type === "major-chord"){
        chordArray = [number, number+4, number+7];
    } else if (type === "minor-chord"){
        chordArray = [number, number+3, number+7]
    } else {
        console.log("Error in creating chord array");
    }
    for (var i=0; i<3; i++){
        var currentNote = chordArray[i];
        recordingArray.push({
            "type" : "noteon",
            "timestamp" : timestamp,
            "channel" : 1,
            "note" : {
                "number" : currentNote,
                "name" : notesList[currentNote].noteName,
                "octave" : notesList[currentNote].octave
            },
            "velocity" : .5
        });
        timestamp += 500;
        recordingArray.push({
            "type" : "noteoff",
            "timestamp" : timestamp,
            "channel" : 1,
            "note" : {
                "number" : currentNote,
                "name" : notesList[currentNote].noteName,
                "octave" : notesList[currentNote].octave
            },
            "velocity" : 0
        });
    }
    for (var i=0; i<3; i++){
        var currentNote = chordArray[i];
        recordingArray.push({
            "type" : "noteon",
            "timestamp" : 2000,
            "channel" : 1,
            "note" : {
                "number" : currentNote,
                "name" : notesList[currentNote].noteName,
                "octave" : notesList[currentNote].octave
            },
            "velocity" : .5
        });
        recordingArray.push({
            "type" : "noteoff",
            "timestamp" : 3500,
            "channel" : 1,
            "note" : {
                "number" : currentNote,
                "name" : notesList[currentNote].noteName,
                "octave" : notesList[currentNote].octave
            },
            "velocity" : 0
        });
    }
    console.log(recordingArray);
    currentOctave = recordingArray[0].note.octave;
    console.log("Current octave is " + currentOctave);
    playback("onscreen-keyboard");
    clearOtherSelectTabs(type);
}

//Function for highlighting selected keys on on screen piano
function keyColourChange(note) {
    var note = notesList[note];
    var noteName = note.noteName + note.octave;
    var substring = '#';
    console.log(noteName);
    if (noteName.indexOf(substring) !== -1) {
        var topId = document.getElementById(noteName + "-top");
        topId.style.backgroundColor = "red";
        console.log("Changed to red colour");
        setTimeout(function () {
            topId.style.backgroundColor = "black";
        }, 300);
    } else {
        var topId = document.getElementById(noteName + "-top");
        var bottomId = document.getElementById(noteName + "-bottom");
        topId.style.backgroundColor = "red";
        bottomId.style.backgroundColor = "red";
        console.log("Changed to red colour");
        setTimeout(function () {
            topId.style.backgroundColor = "white";
            bottomId.style.backgroundColor = "white";
        }, 300);
    }
}

//Emptys recordingArray
function clearRecording(){
    if(recordingArray.length == 0){
        alertTextbox.innerHTML = "Recording is already empty";
        setTimeout(function(){
            alertTextbox.innerHTML = "";
        }, 4000);
    } else {
        recordingArray = [];
        alertTextbox.innerHTML = "Recording cleared";
        setTimeout(function(){
            alertTextbox.innerHTML = "";
        }, 4000);
    }
}

//When user lifts key noteOff is called
function noteOff(event, recordingArray, isRecording){
    if(deviceConnected){
        console.log("noteOff function called");
        console.log(event);
        var note = event.note.name + event.note.octave;
        var substring = "#";
        console.log(note + " stopped");
        if(note.indexOf(substring) !== -1){
            var topId = document.getElementById(note + "-top");
            topId.style.backgroundColor = "black";
        } else {
            var topId = document.getElementById(note + "-top");
            var bottomId = document.getElementById(note + "-bottom");
            topId.style.backgroundColor = "white";
            bottomId.style.backgroundColor = "white";
        }
        if(isRecording){
            recordingArray.push(event);
            console.log("Note Off detected. Array now contains " + recordingArray.length + " events");
        }
    }
}

//Used when transposing a song
//Loops through whole song first checks that it can raise every note by desired amount
//Then loops through again and makes the change
function changeTune(amountOfKeys){
    if(recordingArray.length > 0){
        for (var i = 0; i < recordingArray.length; i++){
                if(recordingArray[i].type == "noteon" || recordingArray[i].type == "noteoff"){
                    var note = recordingArray[i].note.number;
                    if(note + amountOfKeys > 128 || note + amountOfKeys < 0){
                        console.log("Max/min note range reached");
                        return;
                    }
                }
            }

        console.log("Changing tune by " + amountOfKeys + " keys");
        for (var i = 0; i < recordingArray.length; i++){
            var currentEvent = recordingArray[i];
            if(currentEvent.type == "noteon" || currentEvent.type == "noteoff"){
                    console.log(currentEvent.note.number + " is original note number...");
                    currentEvent.note.number += amountOfKeys;
                    currentEvent.note.name = notesList[currentEvent.note.number].noteName;
                    currentEvent.note.octave = notesList[currentEvent.note.number].octave;
                    console.log(currentEvent.note.number + " is new note number.");
                    console.log(currentEvent.note.name + currentEvent.note.octave + " is new note.");
                    console.log(currentEvent);
            }
        }
        console.log("Transpose change by " + amountOfKeys + " keys complete.");
    } else {
        alertTextbox.innerHTML = "Recording stopped. Click 'Play' to listen, or use buttons to edit";
        setTimeout(function(){
            alertTextbox.innerHTML = "";
        }, 4000);
    }
}

//Changes speed by desired amount
//Empty recordingArray will show error message
function changeSpeed(num){
    if(recordingArray.length > 0){
        console.log("Changing speed");
            for (var i = 0; i < recordingArray.length; i++){
                recordingArray[i].timestamp = recordingArray[i].timestamp / num;
            }
        console.log("Speed change by " + num + "x complete.");
    } else {
        alertTextbox.innerHTML = "Record some music before attempting to edit";
        setTimeout(function(){
            alertTextbox.innerHTML = "";
        }, 4000);
    }
}

//Changes velocity i.e. strength at which user presses key
//Function finds the first noteOn, then finds desired change in velocity
//Then finds the multiplier
//Checks each note to ensure each note can change by desired amount
//Empty recordingArray will show error message
function changeVelocity(num){

    if(recordingArray.length > 0){
        var multiplier = 1;
        var desiredVelocity = num;
        for (var i = 0; i < recordingArray.length; i++){
            var currentEvent = recordingArray[i];
            if(currentEvent.type == "noteon"){
                var firstNoteVelocity = currentEvent.velocity;
                var changeInVelocity = desiredVelocity - firstNoteVelocity;
                var percentageChangeInVelocity = changeInVelocity/firstNoteVelocity;
                multiplier = 1 + percentageChangeInVelocity;
                break;
            }
        }
        for (var i = 0; i < recordingArray.length; i++){
            if(recordingArray[i].type == "noteon"){
                var currentEvent = recordingArray[i];
                if(currentEvent.velocity * multiplier > 1 || currentEvent.velocity * multiplier < 0){
                    console.log("Max/min velocity range reached");
                    return;
                }
            }
         }

         console.log("Changing velocity by " + multiplier);
         for (var i = 0; i < recordingArray.length; i++){
             var currentEvent = recordingArray[i];
             if(currentEvent.type == "noteon"){
                     console.log("Old velocity: " + currentEvent.velocity);
                     currentEvent.velocity *= multiplier;
                     console.log("New velocity: " + currentEvent.velocity);
             }

         }
    } else {
        alertTextbox.innerHTML = "Record some music before attempting to edit";
        setTimeout(function(){
            alertTextbox.innerHTML = "";
        }, 4000);
    }
}

//Plays on screen key
function playOnscreenKey(event, playbackTime){
    if (onscreenKeyboardAudio){
        setTimeout(function(){
            startWaveTableNow(event.note.number)}, playbackTime);
    }
}

//Plays back song either onscreen or through the piano
//Series of if statements to check if the key is of type noteon or noteoff etc.
function playback(playbackType){
    console.log(recordingArray);
    var pianoConnected = (input != null);
    if(isRecording){
        isRecording = false;
    }
    if(recordingArray.length > 0){
        console.log("Playback starting...");
        var firstNoteTime = recordingArray[0].timestamp;
        for (var i = 0; i < recordingArray.length; i++){
                var event = recordingArray[i];
                var playbackTime = event.timestamp - firstNoteTime;
                if(event.type == "noteon"){
                    if(playbackType == "onscreen-keyboard"){
                        if(!onscreenKeyboardAudio){
                            onscreenKeyboardAudioToggle();
                        }
                        playOnscreenKey(event, playbackTime);
                    } else if (playbackType == "device" && pianoConnected){
                        console.log("Note: " + event.note.number + ", velocity: " + event.velocity + ", timestamp: " + playbackTime);
                        output.playNote(event.note.number, event.channel, {velocity: event.velocity, time: "+" + playbackTime});
                    }
                    prePlaybackKeyColourChange(event, i, playbackTime);
                } else if(event.type == "noteoff"){
                    console.log("Note: " + event.note.number + ", timestamp: " + playbackTime);
                    if(pianoConnected){
                        output.stopNote(event.note.number, event.channel, {time: "+" + playbackTime});
                    }
                } else if(event.type = "controlchange" && pianoConnected){
                    if(event.value < 64){
                        output.sendControlChange("holdpedal", 0, event.channel, {time: "+" + playbackTime});
                    } else {
                        output.sendControlChange("holdpedal", 127, event.channel, {time: "+" + playbackTime});
                    }
                } else {
                    console.log("Unrecognised event");
                }
            }
    } else {
        alertTextbox.innerHTML = "Nothing on file to play";
        setTimeout(function(){
            alertTextbox.innerHTML = "";
        }, 4000);
    }


}

//This function sets up the key colour change
//Is a handler to ensure the keys play at the right time
//function takes in the timestamp of the event and sets a timeout to call the
//actual keyColourChange function once it is the correct time
function prePlaybackKeyColourChange(event, index, playbackTime){
    var timestamp = event.timestamp;
    console.log("Setting timeout for note " + event.note.number + " for " + timestamp + "ms, playback time " + playbackTime);
    setTimeout(function(){
    playbackKeyColourChange(event, index)}, playbackTime);
}

//function linked to above function
//checks to see if the key is sharp i.e. black by checking substring for #
//this tells the app if it needs to change white->black or vice versa
//matchFound variable works on principal that every noteon should have a noteoff
//once a noteon is found it searches through from that index to find its
//pair
//once a pair is found it sets a timeout to return to its original colour with the timeout
//being the difference in milliseconds between the two
function playbackKeyColourChange(event, index){
    var timestamp = event.timestamp;
    var noteNumber = event.note.number;
    var noteName = event.note.name + event.note.octave;
    var lengthOfNote;
    var whiteKey;
    var topKey = document.getElementById(noteName + "-top");
    var bottomKey;
    topKey.style.backgroundColor = "red";
    var substring = "#";
    if(noteName.indexOf(substring) == -1){
        bottomKey = document.getElementById(noteName + "-bottom");
        bottomKey.style.backgroundColor = "red";
        whiteKey = true;
    }
    console.log("colour change");
    var matchFound = false;
    while(!matchFound){
        var currentEvent = recordingArray[index];
        if(currentEvent.type == "noteoff"){
            if(currentEvent.note.number == noteNumber){
                matchFound = true;
                lengthOfNote = currentEvent.timestamp - event.timestamp;
            }
        }
        index++;
    }
    if(!matchFound){
        console.log("Matching pair not found");
    }
    console.log("Note " + noteName + "started at " + event.timestamp + ", finished at " + currentEvent.timestamp + ", length of note : " + lengthOfNote);
    setTimeout(function()
        { if(whiteKey){
               topKey.style.backgroundColor = "white";
               bottomKey.style.backgroundColor = "white";
               console.log("Changed back to white");
           } else {
               topKey.style.backgroundColor = "black";
               console.log("Changed back to black");
           } }, lengthOfNote);

}

//function that loops through the recording array and reverses everything
//noteon->noteoff and vice versa
//sustain pedals are reversed in value to ensure it sounds ok when played on a piano
function reverseRecording(){
    reversedRecordingArray = [];
    if(recordingArray.length === 0){
        alertTextbox.innerHTML = "Cannot reverse an empty recording";
        setTimeout(function(){
            alertTextbox.innerHTML = "";
        }, 4000);
        return;
    }
    for (var i = recordingArray.length-1; i >= 0; i--){
        reversedRecordingArray.push(recordingArray[i]);
    }

    var lastTimestamp = reversedRecordingArray[0].timestamp;
    console.log("Largest timestamp is " + lastTimestamp);

    for (var i=0; i < reversedRecordingArray.length; i++){
        var currentEvent = reversedRecordingArray[i];
        currentEvent.timestamp = (currentEvent.timestamp * -1) + lastTimestamp;

        if(currentEvent.type === "noteon"){
            currentEvent.type = "noteoff";
            currentEvent.velocity = 0;
        } else if (currentEvent.type === "noteoff"){
            currentEvent.type = "noteon";
            currentEvent.velocity = 0.5;
        } else if (currentEvent.controller.name === "holdpedal"){
            if(currentEvent.value > 64){
                currentEvent.value = 0;
            } else {
                currentEvent.value = 127;
            }

        }
        console.log(currentEvent.type);
    }

    console.log("Initial recording:");
    console.log(recordingArray);
    console.log("Reversed recording:");
    console.log(reversedRecordingArray);
    recordingArray = reversedRecordingArray;

}

//Handler for MIDI message to log to console
function logMidiMessage(message) {
            if ((typeof event === 'undefined') || (event === null)) {
                console.warn("logMidiMessage: null or undefined message received");
                return;
            }
            console.log(message);
        }

//function for saving new songs
//conducts validation before calling ajax request
function saveRecording(songName){

    if(!checkUserLoggedIn()){
        alertTextbox.innerHTML = "Log in before saving any songs";
        setTimeout(function(){
            alertTextbox.innerHTML = "";
        }, 4000);
        return;
    }

    if(songName.trim().length == 0){
        alertTextbox.innerHTML = "Song name must not be blank";
        setTimeout(function(){
            alertTextbox.innerHTML = "";
        }, 4000);
        return;
    }

    var song = {
        "songName" : songName,
        "jsMidiEventList" : recordingArray
    };

    alertTextbox.innerHTML = "Saving. Please wait";

        $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/song/save",
        headers: { 'X-Token': currentToken },
        data: JSON.stringify(song),
        success: function(data){
            var savedSongsDropdown = document.getElementById("saved-songs");
            var newSongOption = document.createElement("option");
            newSongOption.value = data["songId"];
            newSongOption.text = songName;
            savedSongsDropdown.add(newSongOption);
            songsList.push(data);
            alertTextbox.innerHTML = "Song saved";
            songNameInput.value = "";
            setTimeout(function(){
                alertTextbox.innerHTML = "";
            }, 4000);
        }
    })

}

//retrieves song based on songId
function getSongById(songId){
    for (var songIndex = 0; songIndex < songsList.length; songIndex++){
        var currentSong = songsList[songIndex];
        if(currentSong["songId"] == songId){
            return currentSong;
        }
    }
}

//selects song from database using ajax request
function songSelect(dropdownMenu){

    var selectedSongId = dropdownMenu.value;
    recordingArray = getSongById(selectedSongId)["jsMidiEventList"];
    alertTextbox.innerHTML = dropdownMenu.options[dropdownMenu.selectedIndex].text;
    $.ajax({
        type: "GET",
        url: "/song/getSong/" + selectedSongId,
        headers: { 'X-Token': currentToken },
        dataType: "json",
        success: function(data){
            recordingArray = data['jsMidiEventList'];
        }
    });
    clearOtherSelectTabs("saved-songs");

}

//loops through array and sorts into noteon, noteoff, and controlchange
//creates js object for every event, then pushes to jsonArray
//calls ajax request on jsonArray and appends response to Download link
function downloadRecording(){

    var jsonArray = [];
    var firstNoteTime = recordingArray[0].timestamp;
    for (var i = 0; i < recordingArray.length; i++){
        var event = recordingArray[i];

        if(event.type == "noteon" || event.type == "noteoff"){
            data = {
                channel: event.channel,
                type: event.type,
                timestamp: event.timestamp - firstNoteTime,
                note: {
                    number: event.note.number,
                    name: event.note.name,
                    octave: event.note.octave
                },
                velocity: event.velocity
            };
        } else {
            data = {
                channel: event.channel,
                type: event.type,
                timestamp: event.timestamp - firstNoteTime,
                pedalValue: event.value
            };
        }

        jsonArray.push(data);
        console.log("No. " + i + " pushed to jsonArray. Data: " + data);
    }

    console.log(JSON.stringify(jsonArray));


    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/midi/downloadBase64",
        data: JSON.stringify(jsonArray),
        success: function(content){
            window.MIDIDownload = document.createElement("a");
            var date = new Date();
            window.MIDIDownload.download = "midi-recording-" + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + " " + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + "-" + date.getMilliseconds() + ".mid";
            window.MIDIDownload.href = "data:audio/midi;base64," + content;
            window.MIDIDownload.innerHTML = "Download MIDI File";
            document.getElementById('download-button-div').appendChild(window.MIDIDownload);
        }
    })
}

//Writes the songs list for user into the dropdown menu
function populateSongsList(songData){
    var savedSongs = document.getElementById("saved-songs");
    for (var songIndex = 0; songIndex < songData.length; songIndex++){
        var newOption = document.createElement("option");
        newOption.value = songData[songIndex]["songId"];
        newOption.innerHTML = songData[songIndex]["songName"];
        savedSongs.add(newOption);
    }
}

//Calls ajax request to delete a user's account
function deleteAccount(){
    $.ajax({
        type: "GET",
        url: "/user/delete",
        headers: {
            'X-Token' : localStorage.getItem("token")
        },
        success: function(data){
            alertTextbox.innerHTML = "Account deleted. We're sorry to see you go!";
            setTimeout(function(){
                alertTextbox.innerHTML = "";
                window.location.replace("index.html");
            }, 4000);
        },
        error: function (data) {
            console.log(data);
        }
    })
}

//Calls ajax request to load user's songs
//Calls populateSavedSongs function once request is complete
function loadSavedSongs(){
    alertTextbox.innerHTML = "Loading songs";
    $.ajax({
        method: 'GET',
        url: '/song/all',
        headers: {
            'X-Token' : localStorage.getItem("token")
        },
        dataType: 'JSON',
        success: function(data){
            console.log("Data:");
            console.log(data);
            songsList = data;
            console.log(songsList);
            populateSongsList(data);
            alertTextbox.innerHTML = "Saved songs successfully loaded";
            setTimeout(function(){
                alertTextbox.innerHTML = "";
            }, 2000);
        },
        error: function(data){
            console.log("Error in ajax request");
            console.log(data);
        }
    });
}

//Checks token in local storage to ensure valid session
//Once valid session is verified function writes users name accordingly
(function() {
    if(currentToken != null){
        $.ajax({
            method: 'GET',
            url: '/user/info',
            headers: {
                'X-Token' : localStorage.getItem("token")
            },
            dataType: 'JSON',
            success: function(data){
                loadSavedSongs();
                document.getElementById('name-if-logged-in').innerHTML = data['firstName'] + " " + data['lastName'];
            },
            error: function(data){
            }
        });
    }
})();