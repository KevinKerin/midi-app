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

//    @PostMapping("/{userId}/save")
//    public Song saveSong(@PathVariable(name="userId") int userId, @RequestBody List<JSMidiEvent> list){
//        Song newSong = new Song(list, "Test", userId);
//        newSong = songService.saveSong(newSong);
//        return newSong;
//    }

    @PostMapping("/save")
    public int saveSong(@RequestBody List<JSMidiEvent> list){
//        UserId needs to be entered - current method should be used for proof it works only
        Song newSong = new Song(list, "Test", 1);
        newSong = songService.saveSong(newSong);
        return newSong.getSongId();
    }

    @GetMapping("/getSong/{songId}")
    public Song getSong(@PathVariable(name="songId") int songId){
        Song song = songService.findSongBySongId(songId);
        if(song == null){
            return null;
        }
        for (JSMidiEvent jsme : song.getSongEvents()){
            System.out.println(jsme);
        }
        return song;
    }

    @GetMapping("/{userId}")
    public List<Song> getUserSongs(@PathVariable(name="userId") int userId) {
        List<Song> songList = songService.findSongsByUserId(userId);
        for (Song song : songList){
            for (JSMidiEvent jsme : song.getSongEvents()){
                System.out.println(jsme);
            }
            System.out.println();
        }
        return songList;
    }

}
