package com.kevinkerin.midiapp.controller;

import com.kevinkerin.midiapp.model.JSMidiEvent;
import com.kevinkerin.midiapp.model.Song;
import com.kevinkerin.midiapp.service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/song")
public class SongController {

    @Autowired
    private SongService songService;

//    Uses token to validate user, then saves song to database using songService
    @PostMapping("/save")
    public Song saveSong(@RequestBody Song song, @RequestHeader("X-Token") String token){

        Song newSong = songService.saveSong(song, token);

        return newSong;
    }

//    Retrieves song using songId, validates using token
    @GetMapping(value = "/getSong/{songId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Song getSong(@PathVariable(name="songId") int songId, @RequestHeader("X-Token") String token){
        Song song = songService.findSongBySongId(songId, token);

        return song;
    }

//    Returns all users songs - not used in this app for now
    @GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Song> getUserSongs(@RequestHeader("X-Token") String token) {
        List<Song> songList = songService.findSongsByUserId(token);
        for (Song song : songList){
            for (JSMidiEvent jsme : song.getJsMidiEventList()){
                System.out.println(jsme);
            }
            System.out.println();
        }
        return songList;
    }

//    Uses token and songId to validate and find song respectively
//    Deletes entry from table
    @GetMapping(value = "/delete/{songId}")
    public void deleteSong(@PathVariable int songId, @RequestHeader("X-Token") String token){
        songService.deleteSongBySongId(songId, token);
    }

}