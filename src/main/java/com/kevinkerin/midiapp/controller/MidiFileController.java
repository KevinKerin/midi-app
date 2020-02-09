package com.kevinkerin.midiapp.controller;

import com.kevinkerin.midiapp.model.JSMidiEvent;
import com.kevinkerin.midiapp.service.MidiDownloadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/midi")
public class MidiFileController {

    @Autowired
    private MidiDownloadService midiDownloadService;

    @PostMapping(value = "/download", produces = "audio/midi")
    public byte[] downloadMidiFile(@RequestBody List<JSMidiEvent> JSMidiEventList){
        return midiDownloadService.downloadMidiFile(JSMidiEventList);
    }

}