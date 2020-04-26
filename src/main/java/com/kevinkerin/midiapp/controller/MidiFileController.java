package com.kevinkerin.midiapp.controller;

import com.kevinkerin.midiapp.model.JSMidiEvent;
import com.kevinkerin.midiapp.service.MidiDownloadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/midi")
public class MidiFileController {

    @Autowired
    private MidiDownloadService midiDownloadService;

//    Receives list of JSMidiEvents and prints to console
    @GetMapping(value = "/json")
    public void getJson(@RequestBody List<JSMidiEvent> list){
        for (JSMidiEvent jsme : list){
            System.out.println(jsme.toString());
        }
    }

//    Post request for downloading MIDI file in byte array form
//    Will be called by downloadMidiFileBase64
//    Returns byte array of JSMidiEvent list
    @PostMapping(value = "/download", produces = "audio/midi")
    public byte[] downloadMidiFile(@RequestBody List<JSMidiEvent> list){

        for (JSMidiEvent jsme : list){
            System.out.println(jsme.toString());
        }

        return midiDownloadService.downloadMidiFile(list);
    }

//    Post request for downloading MIDI File
//    Returns byte array to user for download
    @PostMapping(value = "/downloadBase64", produces = "text/plain")
    public String downloadMidiFileBase64(@RequestBody List<JSMidiEvent> list){

        for (JSMidiEvent jsme : list){
            System.out.println(jsme.toString());
        }

        return midiDownloadService.downloadMidiFileBase64(list);
    }


}