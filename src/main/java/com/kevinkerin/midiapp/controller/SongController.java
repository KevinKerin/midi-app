package com.kevinkerin.midiapp.controller;

import com.kevinkerin.midiapp.model.JSMidiEvent;
import com.kevinkerin.midiapp.model.Song;
import com.kevinkerin.midiapp.model.User;
import com.kevinkerin.midiapp.service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/song")
public class SongController {

    @Autowired
    SongService songService;

//    @PostMapping("/save")
//    public Song getSong(@PathVariable(name="songId") int songId){
//
//    }

    @PostMapping("/{userId}/save")
    public Song saveSong(@PathVariable(name="userId") int userId, @RequestBody List<JSMidiEvent> list){
        Song newSong = new Song(list, "Test", userId);
        newSong = songService.saveSong(newSong);
        return newSong;
    }

    @GetMapping("/getSong/{songId}")
    public Song getSong(@PathVariable(name="songId") int songId){
        Song song = songService.findSongBySongId(songId);
        if(song == null){
            return null;
        }
        return song;
    }

    @GetMapping("/{userId}")
    public List<Song> getUserSongs(@PathVariable(name="userId") int userId) {
        return songService.findSongsByUserId(userId);
    }

}
