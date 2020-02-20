var synth = new Tone.AMSynth().toMaster();
console.log(synth);
var recordingArray = [],
input, output, isRecording = false;;
var icon = document.getElementById("icon");
var notesList = [];
createNoteList(notesList);

WebMidi.enable(function () {

    console.log(WebMidi.inputs);
    console.log(WebMidi.outputs);
    console.log(WebMidi.inputs.length);
    console.log(WebMidi.outputs.length);

    input = WebMidi.inputs[0];
    output = WebMidi.outputs[0];

    document.getElementById("connected-input").innerHTML = input.name;
    document.getElementById("connected-output").innerHTML = output.name;

    console.log(input);
    console.log(output);

//    document.getElementById('show-log').addEventListener('click', showLog);
    document.getElementById('playback').addEventListener('click', playback);
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
    document.getElementById('download-recording').addEventListener('click', function() {downloadRecording()})

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
    for (var i = -1; i < 10; i++){
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
}

function noteOn(event, recordingArray, isRecording){
    console.log("noteOn function called");
    if(isRecording){
        icon.style.visibility = "visible";
        synth.triggerAttack(note);
        logMidiMessage(event);
        recordingArray.push(event);
        console.log("Array now contains " + recordingArray.length + " events.");
    }
    var note = event.note.name + event.note.octave;
    var substring = "#";
    console.log(note + " pressed at " + event.velocity);
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
        synth.triggerRelease();
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


function playback(){
    if(isRecording){
        isRecording = false;
    }
    if(recordingArray.length > 0){
        console.log("Playback starting...");
        var firstNoteTime = recordingArray[0].timestamp;
        for (var i = 0; i < recordingArray.length; i ++){
                var event = recordingArray[i];
                var playbackTime = event.timestamp - firstNoteTime;
                if(event.type == "noteon"){
                    console.log("Note: " + event.note.number + ", velocity: " + event.velocity + ", timestamp: " + playbackTime);
                    output.playNote(event.note.number, event.channel, {velocity: event.velocity, time: "+" + playbackTime});
//                    var currentNote = document.getElementById(event.note.name + event.note.octave + "-top");
//                    console.log(currentNote);
//                    console.log("Event timestamp: " + event.timestamp);
                    preKeyColourChange(event, i, playbackTime);
                } else if(event.type == "noteoff"){
                    console.log("Note: " + event.note.number + ", timestamp: " + playbackTime);
                    output.stopNote(event.note.number, event.channel, {time: "+" + playbackTime});
//                    depressedKeyColourChange(event.note.name + event.note.octave);
//                    document.getElementById(event.note.name + event.note.octave + "-top").style.backgroundColor = "black";
//                    noteOff(event, recordingArray, isRecording);
                } else if(event.type = "controlchange"){
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

function preKeyColourChange(event, index, playbackTime){
    var timestamp = event.timestamp;
    console.log("Setting timeout for note " + event.note.number + " for " + timestamp + "ms, playback time " + playbackTime);
    setTimeout(function(){
    keyColourChange(event, index)}, playbackTime);
}

function keyColourChange(event, index){
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

//    for(var i = index; i < recordingArray.length; i++){
//        var matchingPairSearch = recordingArray[i];
//        console.log(matchingPairSearch);
//        if(matchingPairSearch.type == "noteoff"){
//            if(matchingPairSearch.note.number == noteNumber){
//                lengthOfNote = matchingPairSearch.timestamp - event.timestamp;
//            }
//        }
//    }
//    if (lengthOfNote == null){
//        console.log("Matching pair not found");
//    }
    console.log("Note " + noteName + "started at " + event.timestamp + ", finished at " + currentEvent.timestamp + ", length of note : " + lengthOfNote);
//    setTimeout(lengthOfNote);
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

//function depressedKeyColourChange(key){
//    var substring = "#";
//    if(key.indexOf(substring) == -1){
//        document.getElementById(key + "-top").style.backgroundColor = "white";
//        document.getElementById(key + "-bottom").style.backgroundColor = "white";
//    } else {
//        document.getElementById(key + "-top").style.backgroundColor = "black";
//    }
//    console.log("colour change back");
//}



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

//    for (var j = 0; j < jsonArray.length; j++){
        console.log(JSON.stringify(jsonArray));
//    }

//    jsonArray = JSON.stringify(jsonArray);
//    var test = {"channel" : "1", "type" : "noteoff", "timestamp" : "1234.123"}
//    $.ajax({contentType: 'application/json'},  "/midi/download", JSON.stringify(array));

    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: '/midi/download',
        data: JSON.stringify(jsonArray),
        success: function(content){
            window.MIDIDownload = document.createElement("a");
            var date = new Date();
            const mediaStream = new MediaStream();
            const file = document.getElementById('a');
            file.srcObject = mediaStream;
//            window.MIDIDownload.href = window.URL.createObjectURL(new Blob(content));
            window.MIDIDownload.href = content.dataURI;
            MIDIDownload.click();
        }
    });
}

function trickOfTheLight(i){
    trickLyrics(i);
    output.playNote(["B2", "D#3", "F#3", "B3", "D#4"], 1, {duration: 2000});
    sleep(1000);
    output.playNote(["B2", "D#3"], 1, {duration: 1000});
    sleep(1000);
    output.playNote(["A#2", "F#3", "A#3", "F#4"], 1, {duration: 1000});
    sleep(1000);
    output.playNote(["A#2", "D3", "F3", "A#3", "D4", "F4"], 1, {duration: 1000});
    sleep(1000);
    output.playNote(["A#2", "D#3", "A#3", "D#4"], 1, {duration: 1000});
    sleep(1000);
    output.playNote(["A#2", "D#3"], 1, {duration: 1000});
    sleep(1000);
    output.playNote(["A#2", "C#3", "A#3", "C#4"], 1, {duration: 1000});
    sleep(1000);
    output.playNote(["A#2", "C#3"], 1, {duration: 1000});
    sleep(1000);
    if(i == 2){
        trickMelody();
    }
}

function trickMelody(){
    output.playNote("C#5", 1).stopNote("C#5", 1, {time: 400, velocity: 0.8});
    output.playNote("G#4", 1, {time: "+650"}).stopNote("G#4", 1, {time: 250, velocity: 0.55});
    output.playNote("G#4", 1, {time: "+850"}).stopNote("G#4", 1, {time: 600, velocity: 0.75});
    output.playNote("G#4", 1, {time: "+1500"}).stopNote("G#4", 1, {time: 300, velocity: 0.55});
    output.playNote("G#4", 1, {time: "+1700"}).stopNote("G#4", 1, {time: 500, velocity: 0.75});
    output.playNote("F#4", 1, {time: "+2300"}).stopNote("F#4", 1, {time: 400, velocity: 0.7});

    output.playNote("D#4", 1, {time: "+3300"}).stopNote("D#4", 1, {time: 150, velocity: 0.55});
    output.playNote("D#4", 1, {time: "+3400"}).stopNote("D#4", 1, {time: 250, velocity: 0.55});
    output.playNote("D#5", 1, {time: "+3700"}).stopNote("D#5", 1, {time: 300, velocity: 0.75});
    output.playNote("G#4", 1, {time: "+4500"}).stopNote("G#4", 1, {time: 200, velocity: 0.5});
    output.playNote("G#4", 1, {time: "+5000"}).stopNote("G#4", 1, {time: 300, velocity: 0.75});
    output.playNote("G#4", 1, {time: "+5300"}).stopNote("G#4", 1, {time: 200, velocity: 0.6});
    output.playNote("F#4", 1, {time: "+6000"}).stopNote("F#4", 1, {time: 400, velocity: 0.75});

    output.playNote("C#5", 1, {time: "+7800"}).stopNote("C#5", 1, {time: 400, velocity: 0.8});
    output.playNote("C#5", 1, {time: "+8100"}).stopNote("C#5", 1, {time: 400, velocity: 0.8});
    output.playNote("G#4", 1, {time: "+8650"}).stopNote("G#4", 1, {time: 250, velocity: 0.55});
    output.playNote("G#4", 1, {time: "+8850"}).stopNote("G#4", 1, {time: 600, velocity: 0.75});
    output.playNote("G#4", 1, {time: "+9500"}).stopNote("G#4", 1, {time: 300, velocity: 0.55});
    output.playNote("G#4", 1, {time: "+9700"}).stopNote("G#4", 1, {time: 500, velocity: 0.75});
    output.playNote("F#4", 1, {time: "+10300"}).stopNote("F#4", 1, {time: 400, velocity: 0.7});

    output.playNote("D#4", 1, {time: "+11000"}).stopNote("D#4", 1, {time: 250, velocity: 0.65});
    output.playNote("D#5", 1, {time: "+11700"}).stopNote("D#5", 1, {time: 300, velocity: 0.75});
    output.playNote("G#4", 1, {time: "+12500"}).stopNote("G#4", 1, {time: 200, velocity: 0.5});
    output.playNote("G#4", 1, {time: "+13000"}).stopNote("G#4", 1, {time: 300, velocity: 0.75});
    output.playNote("G#4", 1, {time: "+13300"}).stopNote("G#4", 1, {time: 200, velocity: 0.6});
    output.playNote("F#4", 1, {time: "+14000"}).stopNote("F#4", 1, {time: 400, velocity: 0.75});

    output.playNote("C#5", 1, {time: "+15000"}).stopNote("C#5", 1, {time: 400, velocity: 0.8});
    output.playNote("C#5", 1, {time: "+15500"}).stopNote("C#5", 1, {time: 400, velocity: 0.8});
    output.playNote("G#4", 1, {time: "+16650"}).stopNote("G#4", 1, {time: 250, velocity: 0.55});
    output.playNote("G#4", 1, {time: "+16850"}).stopNote("G#4", 1, {time: 600, velocity: 0.75});
    output.playNote("G#4", 1, {time: "+17500"}).stopNote("G#4", 1, {time: 300, velocity: 0.55});
    output.playNote("G#4", 1, {time: "+17700"}).stopNote("G#4", 1, {time: 500, velocity: 0.75});
    output.playNote("F#4", 1, {time: "+18300"}).stopNote("F#4", 1, {time: 400, velocity: 0.7});

    output.playNote("D#4", 1, {time: "+18800"}).stopNote("D#4", 1, {time: 150, velocity: 0.55});
    output.playNote("D#4", 1, {time: "+19400"}).stopNote("D#4", 1, {time: 250, velocity: 0.55});
    output.playNote("D#5", 1, {time: "+19700"}).stopNote("D#5", 1, {time: 300, velocity: 0.75});
    output.playNote("G#4", 1, {time: "+20500"}).stopNote("G#4", 1, {time: 200, velocity: 0.5});
    output.playNote("G#4", 1, {time: "+21000"}).stopNote("G#4", 1, {time: 300, velocity: 0.75});
    output.playNote("G#4", 1, {time: "+21300"}).stopNote("G#4", 1, {time: 200, velocity: 0.6});
    output.playNote("F#4", 1, {time: "+22000"}).stopNote("F#4", 1, {time: 400, velocity: 0.75});

    output.playNote("C#5", 1, {time: "+23500"}).stopNote("C#5", 1, {time: 400, velocity: 0.8});
    output.playNote("C#5", 1, {time: "+24200"}).stopNote("C#5", 1, {time: 400, velocity: 0.8});
    output.playNote("G#4", 1, {time: "+24650"}).stopNote("G#4", 1, {time: 250, velocity: 0.55});
    output.playNote("G#4", 1, {time: "+24850"}).stopNote("G#4", 1, {time: 600, velocity: 0.75});
    output.playNote("G#4", 1, {time: "+25500"}).stopNote("G#4", 1, {time: 300, velocity: 0.55});
    output.playNote("G#4", 1, {time: "+25700"}).stopNote("G#4", 1, {time: 500, velocity: 0.75});
    output.playNote("F#4", 1, {time: "+26300"}).stopNote("F#4", 1, {time: 400, velocity: 0.7});


}

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