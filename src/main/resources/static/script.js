var synth = new Tone.AMSynth().toMaster();
var recordingArray = [];
var reversedRecordingArray = [];
var keyMap;
var keyboardMap;
var input;
var output;
var isRecording = false;
var icon = document.getElementById("icon");
var notesList = [];
createNoteList(notesList);
var onscreenKeyboardAudio = true;
var selectedPreset=_tone_0000_Aspirin_sf2_file;
var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContextFunc();
var player=new WebAudioFontPlayer();
player.adjustPreset(audioContext,selectedPreset);
function startWaveTableNow(pitch) {
    var audioBufferSourceNode = player.queueWaveTable(audioContext, audioContext.destination, selectedPreset, audioContext.currentTime + 0, pitch, 1.0);
}

WebMidi.enable(function () {

    setKeyMap();
    console.log(notesList);

    console.log(WebMidi.inputs);
    console.log(WebMidi.outputs);
    console.log(WebMidi.inputs.length);
    console.log(WebMidi.outputs.length);

   input = WebMidi.inputs[0];
   output = WebMidi.outputs[0];

//    input = WebMidi.getInputById('1570184708');
//    output = WebMidi.getOutputById('284624427');



    console.log(input);
    console.log(output);

//    document.getElementById('show-log').addEventListener('click', showLog);
    document.getElementById('playback').addEventListener('click', function() {playback("device")});
    document.getElementById('onscreen-keyboard-playback').addEventListener('click', function() {playback("onscreen-keyboard")});
    document.getElementById('start-recording').addEventListener('click', startRecording);
    document.getElementById('stop-recording').addEventListener('click', stopRecording);
    document.getElementById('clear-recording').addEventListener('click', clearRecording);
    document.getElementById('login').addEventListener('click', login);
    document.getElementById('octave-down').addEventListener('click', function() {changeTune(-12)});
    document.getElementById('octave-up').addEventListener('click', function() {changeTune(12)});
    document.getElementById('transpose-down').addEventListener('click', function() {changeTune(-1)});
    document.getElementById('transpose-up').addEventListener('click', function() {changeTune(1)});
    document.getElementById('speed-up').addEventListener('click', function() {changeSpeed(1.1)});
    document.getElementById('speed-down').addEventListener('click', function() {changeSpeed(0.9)});
    document.getElementById('harden').addEventListener('click', function() {changeVelocity(1.1)});
    document.getElementById('soften').addEventListener('click', function() {changeVelocity(0.9)});
    document.getElementById('reverse-recording').addEventListener('click', function() {reverseRecording()});
    document.getElementById('onscreen-keyboard-audio-toggle').addEventListener('click', onscreenKeyboardAudioToggle);
    document.getElementById('save-recording').addEventListener('click', function() {saveRecording()});
    document.getElementById('download-recording').addEventListener('click', function() {downloadRecording()});
    document.addEventListener('keypress', keyboardListener);
    input.addListener('noteon', "all", function(e) {noteOn(e, recordingArray, isRecording)});
    input.addListener('noteoff', "all", function(e) {noteOff (e, recordingArray, isRecording)});
    input.addListener('controlchange', "all", function (e) {
        if(isRecording){
            console.log("Received 'controlchange' message.", e);
                recordingArray.push(e);
        }
    });

    input.addListener('songselect', 'all',
        function(e){
            console.log(e.data);
            console.log(e.timestamp);
            console.log(e.type);
            console.log(e.song);
        });

    input.addListener('pitchbend', 3,
        function (e) {
          console.log("Received 'pitchbend' message.", e);
        }
    );

});

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

function setupConnection(){
    var inputSelect = document.getElementById("input-connections");
    var outputSelect = document.getElementById("output-connections");
    for (var i = 0; i < WebMidi.inputs.length; i++){
        var option = document.createElement("option");
        var optionText = WebMidi.inputs[i]._midiInput.manufacturer + " " + WebMidi.inputs[i]._midiInput.name;
        option.text = optionText;
        inputSelect.add(option);
    }
    for (var i = 0; i < WebMidi.outputs.length; i++){
        var option = document.createElement("option");
        var optionText = WebMidi.outputs[i]._midiOutput.manufacturer + " " + WebMidi.outputs[i]._midiOutput.name;
        option.text = optionText;
        outputSelect.add(option);
    }
}

function deviceConnection(){
    input = WebMidi.inputs[document.getElementById("input-connections").selectedIndex];
    output = WebMidi.outputs[document.getElementById("output-connections").selectedIndex];

    displayConnections();
}

function displayConnections(){
    document.getElementById("connected-input").innerHTML = input.name;
    document.getElementById("connected-output").innerHTML = output.name;
}

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

function startRecording(){
    alert("Recording will begin when you start playing");
    console.log("Recording starting...");
    isRecording = true;
    recordingArray = [];
}

function stopRecording(){
    if(isRecording){
        isRecording = false;
        console.log("Recording stopped");
        icon.style.visibility = "hidden";
        alert("Recording stopped. Click 'Play' to listen, or use buttons to edit");
    } else {
        alert("Device is not being recorded. Click 'Start Recording to begin, or 'Play' to listen");
    }
    console.log(recordingArray);
}

function onscreenKeyboardAudioToggle(){
    if(onscreenKeyboardAudio){
        document.getElementById('onscreen-keyboard-audio-toggle').value = 'On Screen Keyboard Audio: Off';
        onscreenKeyboardAudio = false;
    } else {
        document.getElementById('onscreen-keyboard-audio-toggle').value = 'On Screen Keyboard Audio: On';
        onscreenKeyboardAudio = true;
    }
}

function noteOn(event, recordingArray, isRecording){
    console.log("noteOn function called");
    console.log(event);
    if(isRecording){
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

function setKeyMap(){
    keyMap = new Map();
    keyboardMap = ['KeyZ', 'KeyS', 'KeyX', 'KeyD', 'KeyC', 'KeyV', 'KeyG', 'KeyB', 'KeyH', 'KeyN', 'KeyJ',
    'KeyM', 'KeyQ', 'Digit2', 'KeyW', 'Digit3', 'KeyE', 'KeyR', 'Digit5', 'KeyT', 'Digit6', 'KeyY', 'Digit7',
    'KeyU', 'KeyI', 'Digit9', 'KeyO', 'Digit0', 'KeyP', 'BracketLeft', 'Equal', 'BracketRight'];
    for (var i = 48; i < 80; i++){
        keyMap.set(keyboardMap[i-48], i);
    }
}

function keyboardListener(key){
    console.log("Keyboard listener");
    try{
        var note = keyMap.get(key.code);
        startWaveTableNow(note);
        keyColourChange(note);
    } catch (error){
    }
}

function clearOtherSelectTabs(selectedOption){
    var options = ["major-chord", "minor-chord", "major-scale", "minor-scale"];
    for (var i=0; i<options.length; i++){
        var currentSelection = document.getElementById(options[i]);
        console.log(currentSelection.id);
        console.log(selectedOption);
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

function scaleSelect(type){
    var scaleSelect = document.getElementById(type);
    var currentSelection = scaleSelect.options[scaleSelect.selectedIndex].value;
    var type = scaleSelect.id;
    console.log(type);
    playScale(currentSelection, type);
}

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
    playback("onscreen-keyboard");
    clearOtherSelectTabs(type);
}

function chordSelect(type){
    var chordSelect = document.getElementById(type);
    var currentSelection = chordSelect.options[chordSelect.selectedIndex].value;
    var type = chordSelect.id;
    console.log(type);
    playChord(currentSelection, type);
}

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
    playback("onscreen-keyboard");
    clearOtherSelectTabs(type);
}

function keyColourChange(note){
    var note = notesList[note];
    var noteName = note.noteName + note.octave;
    var substring = '#';
    console.log(noteName);
    if(noteName.indexOf(substring) !== -1){
        var topId = document.getElementById(noteName + "-top");
        topId.style.backgroundColor = "red";
        console.log("Changed to red colour");
        setTimeout(function(){
            topId.style.backgroundColor = "black";
        }, 300);
    } else {
        var topId = document.getElementById(noteName + "-top");
        var bottomId = document.getElementById(noteName + "-bottom");
        topId.style.backgroundColor = "red";
        bottomId.style.backgroundColor = "red";
        console.log("Changed to red colour");
        setTimeout(function(){
            topId.style.backgroundColor = "white";
            bottomId.style.backgroundColor = "white";
        }, 300);
    }
}

function clickColourChange(id){

}

function clearRecording(){
    if(recordingArray.length == 0){
        alert("Recording is already empty");
    } else {
        recordingArray = [];
        alert("Recording cleared");
    }
}

function noteOff(event, recordingArray, isRecording){
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
        alert("Transpose change by " + amountOfKeys + " keys complete.");
    } else {
        alert("Record some music before attempting to edit");
    }
}

function changeSpeed(num){
    if(recordingArray.length > 0){
        console.log("Changing speed");
            for (var i = 0; i < recordingArray.length; i++){
                recordingArray[i].timestamp = recordingArray[i].timestamp / num;
            }
        console.log("Speed change by " + num + "x complete.");
        alert("Speed change by " + num + "x complete.");
    } else {
        alert("Record some music before attempting to edit");
    }
}

function changeVelocity(num){
    if(recordingArray.length > 0){
        for (var i = 0; i < recordingArray.length; i++){
            if(recordingArray[i].type == "noteon"){
                var currentEvent = recordingArray[i];
                if(currentEvent.velocity * num > 128 || currentEvent.velocity * num < 0){
                    console.log("Max/min velocity range reached");
                    return;
                }
            }
         }

         console.log("Changing velocity by " + num + "x");
         for (var i = 0; i < recordingArray.length; i++){
             var currentEvent = recordingArray[i];
             if(currentEvent.type == "noteon"){
                     console.log("Old velocity: " + currentEvent.velocity);
                     currentEvent.velocity *= num;
                     console.log("New velocity: " + currentEvent.velocity);
             }

         }
         console.log("Velocity change by " + num + "x complete.");
         alert("Velocity change by " + num + "x complete.");
    } else {
        alert("Record some music before attempting to edit");
    }
}

//function onscreenPlayback(){
//    if(isRecording){
//            isRecording = false;
//    }
//    if(!onscreenKeyboardAudio){
//        onscreenKeyboardAudioToggle();
//    }
//    if(recordingArray.length > 0){
//        console.log("On Screen Playback starting...");
//        for (var i = 0; i < recordingArray.length; i++){
//            var currentEvent = recordingArray[i];
//            if(currentEvent.type == "noteon"){
//
//            }
//        }
//    } else {
//        console.log("Nothing on file to play");
//    }
//}

function playOnscreenKey(event, playbackTime){
    if (onscreenKeyboardAudio){
        setTimeout(function(){
            startWaveTableNow(event.note.number)}, playbackTime);
    }
}

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
//                    var currentNote = document.getElementById(event.note.name + event.note.octave + "-top");
//                    console.log(currentNote);
//                    console.log("Event timestamp: " + event.timestamp);
                    prePlaybackKeyColourChange(event, i, playbackTime);
                } else if(event.type == "noteoff"){
                    console.log("Note: " + event.note.number + ", timestamp: " + playbackTime);
                    if(pianoConnected){
                        output.stopNote(event.note.number, event.channel, {time: "+" + playbackTime});
                    }
//                    depressedKeyColourChange(event.note.name + event.note.octave);
//                    document.getElementById(event.note.name + event.note.octave + "-top").style.backgroundColor = "black";
//                    noteOff(event, recordingArray, isRecording);
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
        alert("Nothing on file to play");
    }


}

function prePlaybackKeyColourChange(event, index, playbackTime){
    var timestamp = event.timestamp;
    console.log("Setting timeout for note " + event.note.number + " for " + timestamp + "ms, playback time " + playbackTime);
    setTimeout(function(){
    playbackKeyColourChange(event, index)}, playbackTime);
}

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

function reverseRecording(){
    reversedRecordingArray = [];
    if(recordingArray.length === 0){
        alert("Cannot reverse an empty recording.");
        return;
    }
    for (var i = recordingArray.length-1; i >= 0; i--){
        console.log(recordingArray[i]);
        reversedRecordingArray.push(recordingArray[i]);
    }
    console.log(reversedRecordingArray);
    // console.log("Beginning timestamp changes etc.")

    var lastTimestamp = reversedRecordingArray[0].timestamp;
    console.log("Largest timestamp is " + lastTimestamp);

    for (var i=0; i < reversedRecordingArray.length; i++){
    //    loop through reversed array and change the timestamp i.e. 4000 becomes 0, 1000 becomes 3000, 2500 becomes 1500
    //    1 becomes 3999
    //    change noteon to noteoff and vice versa
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

function logMidiMessage(message) {
            if ((typeof event === 'undefined') || (event === null)) {
                console.warn("logMidiMessage: null or undefined message received");
                return;
            }
            console.log(message);
        }

function onMIDISuccess(midiAccess) {
    for (var input of midiAccess.inputs.values()){
        input.onmidimessage = getMIDIMessage;
        console.log(input.onmidimessage);
    }
}

function getMIDIMessage(message) {
    var command = message.data[0];
    var note = message.data[1];
    var velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command

    switch (command) {
        case 144: // noteOn
            if (velocity > 0) {
                noteOn(note, velocity);
            } else {
                noteOff(note);
            }
            break;
        case 128: // noteOff
            noteOff(note);
            break;
        // we could easily expand this switch statement to cover other types of commands such as controllers or sysex
    }
}

//function noteOn(note, velocity){
//    console.log("Note pressed: " + note + " at " + velocity + " velocity");
//
//}
//
//function noteOff(note){
//    console.log("Note stopped: " + note);
//
//}

function saveRecording(){

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/song/save",
        data: JSON.stringify(recordingArray),
        success: function(data){
            var savedSongsDropdown = document.getElementById("saved-songs");
            var newSong = document.createElement("option");
            newSong.text = "Song ID " + data;
            newSong.value = data;
            savedSongsDropdown.add(newSong);
        }
    })

}

function songSelect(selectedOption){

    var selectedSongId = selectedOption.value;
    $.ajax({
        type: "GET",
        url: "/song/getSong/" + selectedSongId,
        success: function(data){
            // recordingArray = JSON.parse(data);
            console.log(data);
        }
    })

}

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
                noteNumber: event.note.number,
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
            document.getElementById('buttons').appendChild(window.MIDIDownload);
        }
    })
}

// function trickOfTheLight(i){
//     trickLyrics(i);
//     output.playNote(["B2", "D#3", "F#3", "B3", "D#4"], 1, {duration: 2000});
//     sleep(1000);
//     output.playNote(["B2", "D#3"], 1, {duration: 1000});
//     sleep(1000);
//     output.playNote(["A#2", "F#3", "A#3", "F#4"], 1, {duration: 1000});
//     sleep(1000);
//     output.playNote(["A#2", "D3", "F3", "A#3", "D4", "F4"], 1, {duration: 1000});
//     sleep(1000);
//     output.playNote(["A#2", "D#3", "A#3", "D#4"], 1, {duration: 1000});
//     sleep(1000);
//     output.playNote(["A#2", "D#3"], 1, {duration: 1000});
//     sleep(1000);
//     output.playNote(["A#2", "C#3", "A#3", "C#4"], 1, {duration: 1000});
//     sleep(1000);
//     output.playNote(["A#2", "C#3"], 1, {duration: 1000});
//     sleep(1000);
//     if(i == 2){
//         trickMelody();
//     }
// }
//
// function trickMelody(){
//     output.playNote("C#5", 1).stopNote("C#5", 1, {time: 400, velocity: 0.8});
//     output.playNote("G#4", 1, {time: "+650"}).stopNote("G#4", 1, {time: 250, velocity: 0.55});
//     output.playNote("G#4", 1, {time: "+850"}).stopNote("G#4", 1, {time: 600, velocity: 0.75});
//     output.playNote("G#4", 1, {time: "+1500"}).stopNote("G#4", 1, {time: 300, velocity: 0.55});
//     output.playNote("G#4", 1, {time: "+1700"}).stopNote("G#4", 1, {time: 500, velocity: 0.75});
//     output.playNote("F#4", 1, {time: "+2300"}).stopNote("F#4", 1, {time: 400, velocity: 0.7});
//
//     output.playNote("D#4", 1, {time: "+3300"}).stopNote("D#4", 1, {time: 150, velocity: 0.55});
//     output.playNote("D#4", 1, {time: "+3400"}).stopNote("D#4", 1, {time: 250, velocity: 0.55});
//     output.playNote("D#5", 1, {time: "+3700"}).stopNote("D#5", 1, {time: 300, velocity: 0.75});
//     output.playNote("G#4", 1, {time: "+4500"}).stopNote("G#4", 1, {time: 200, velocity: 0.5});
//     output.playNote("G#4", 1, {time: "+5000"}).stopNote("G#4", 1, {time: 300, velocity: 0.75});
//     output.playNote("G#4", 1, {time: "+5300"}).stopNote("G#4", 1, {time: 200, velocity: 0.6});
//     output.playNote("F#4", 1, {time: "+6000"}).stopNote("F#4", 1, {time: 400, velocity: 0.75});
//
//     output.playNote("C#5", 1, {time: "+7800"}).stopNote("C#5", 1, {time: 400, velocity: 0.8});
//     output.playNote("C#5", 1, {time: "+8100"}).stopNote("C#5", 1, {time: 400, velocity: 0.8});
//     output.playNote("G#4", 1, {time: "+8650"}).stopNote("G#4", 1, {time: 250, velocity: 0.55});
//     output.playNote("G#4", 1, {time: "+8850"}).stopNote("G#4", 1, {time: 600, velocity: 0.75});
//     output.playNote("G#4", 1, {time: "+9500"}).stopNote("G#4", 1, {time: 300, velocity: 0.55});
//     output.playNote("G#4", 1, {time: "+9700"}).stopNote("G#4", 1, {time: 500, velocity: 0.75});
//     output.playNote("F#4", 1, {time: "+10300"}).stopNote("F#4", 1, {time: 400, velocity: 0.7});
//
//     output.playNote("D#4", 1, {time: "+11000"}).stopNote("D#4", 1, {time: 250, velocity: 0.65});
//     output.playNote("D#5", 1, {time: "+11700"}).stopNote("D#5", 1, {time: 300, velocity: 0.75});
//     output.playNote("G#4", 1, {time: "+12500"}).stopNote("G#4", 1, {time: 200, velocity: 0.5});
//     output.playNote("G#4", 1, {time: "+13000"}).stopNote("G#4", 1, {time: 300, velocity: 0.75});
//     output.playNote("G#4", 1, {time: "+13300"}).stopNote("G#4", 1, {time: 200, velocity: 0.6});
//     output.playNote("F#4", 1, {time: "+14000"}).stopNote("F#4", 1, {time: 400, velocity: 0.75});
//
//     output.playNote("C#5", 1, {time: "+15000"}).stopNote("C#5", 1, {time: 400, velocity: 0.8});
//     output.playNote("C#5", 1, {time: "+15500"}).stopNote("C#5", 1, {time: 400, velocity: 0.8});
//     output.playNote("G#4", 1, {time: "+16650"}).stopNote("G#4", 1, {time: 250, velocity: 0.55});
//     output.playNote("G#4", 1, {time: "+16850"}).stopNote("G#4", 1, {time: 600, velocity: 0.75});
//     output.playNote("G#4", 1, {time: "+17500"}).stopNote("G#4", 1, {time: 300, velocity: 0.55});
//     output.playNote("G#4", 1, {time: "+17700"}).stopNote("G#4", 1, {time: 500, velocity: 0.75});
//     output.playNote("F#4", 1, {time: "+18300"}).stopNote("F#4", 1, {time: 400, velocity: 0.7});
//
//     output.playNote("D#4", 1, {time: "+18800"}).stopNote("D#4", 1, {time: 150, velocity: 0.55});
//     output.playNote("D#4", 1, {time: "+19400"}).stopNote("D#4", 1, {time: 250, velocity: 0.55});
//     output.playNote("D#5", 1, {time: "+19700"}).stopNote("D#5", 1, {time: 300, velocity: 0.75});
//     output.playNote("G#4", 1, {time: "+20500"}).stopNote("G#4", 1, {time: 200, velocity: 0.5});
//     output.playNote("G#4", 1, {time: "+21000"}).stopNote("G#4", 1, {time: 300, velocity: 0.75});
//     output.playNote("G#4", 1, {time: "+21300"}).stopNote("G#4", 1, {time: 200, velocity: 0.6});
//     output.playNote("F#4", 1, {time: "+22000"}).stopNote("F#4", 1, {time: 400, velocity: 0.75});
//
//     output.playNote("C#5", 1, {time: "+23500"}).stopNote("C#5", 1, {time: 400, velocity: 0.8});
//     output.playNote("C#5", 1, {time: "+24200"}).stopNote("C#5", 1, {time: 400, velocity: 0.8});
//     output.playNote("G#4", 1, {time: "+24650"}).stopNote("G#4", 1, {time: 250, velocity: 0.55});
//     output.playNote("G#4", 1, {time: "+24850"}).stopNote("G#4", 1, {time: 600, velocity: 0.75});
//     output.playNote("G#4", 1, {time: "+25500"}).stopNote("G#4", 1, {time: 300, velocity: 0.55});
//     output.playNote("G#4", 1, {time: "+25700"}).stopNote("G#4", 1, {time: 500, velocity: 0.75});
//     output.playNote("F#4", 1, {time: "+26300"}).stopNote("F#4", 1, {time: 400, velocity: 0.7});
//
//
// }

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function login(){
    var loginData = {};
    $.post( "/user/login", loginData)
      .done(function( data ) {
        alert( "Data Loaded: " + data );
      });
}