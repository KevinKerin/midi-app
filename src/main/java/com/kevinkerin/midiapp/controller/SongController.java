package com.kevinkerin.midiapp.controller;

import com.kevinkerin.midiapp.model.JSMidiEvent;
import com.kevinkerin.midiapp.model.Song;
import com.kevinkerin.midiapp.model.User;
import com.kevinkerin.midiapp.service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
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
    public int saveSong(@RequestBody Song song){
//        UserId needs to be entered - current method should be used for proof it works only
//        Song newSong = new Song(list, "Test", 1);

        Song newSong = songService.saveSong(song);

        return newSong.getSongId();
    }

    @GetMapping(value = "/getSong/{songId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String getSong(@PathVariable(name="songId") int songId){
        Song song = songService.findSongBySongId(songId);
//        if(song == null){
//            return null;
//        }
//        for (JSMidiEvent jsme : song.getSongEvents()){
//            System.out.println(jsme);
//        }
        String result = "" + song.getSongId() + ", " + song.getSongName() + ", length: " + song.getSongLength();
        return song.toString();
    }


    @GetMapping("/{userId}")
    public List<Song> getUserSongs(@PathVariable(name="userId") int userId) {
        List<Song> songList = songService.findSongsByUserId(userId);
        for (Song song : songList){
            for (JSMidiEvent jsme : song.getJsMidiEventList()){
                System.out.println(jsme);
            }
            System.out.println();
        }
        return songList;
    }

}
