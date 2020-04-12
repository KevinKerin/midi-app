package com.kevinkerin.midiapp.service;

import com.kevinkerin.midiapp.dal.SongRepository;
import com.kevinkerin.midiapp.exception.ValidationException;
import com.kevinkerin.midiapp.model.JSMidiEvent;
import com.kevinkerin.midiapp.model.Note;
import com.kevinkerin.midiapp.model.Song;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class SongService {

    @Autowired
    private SongRepository songRepository;

    public Song saveSong(Song song){
        song.setDate(new Date());
        List<JSMidiEvent> eventList = song.getJsMidiEventList();
        song.setJsMidiEventList(new ArrayList<>());
        Song savedSong = songRepository.save(song);
        for (JSMidiEvent jsme : eventList){
            jsme.setSong(savedSong);
        }
        song.setJsMidiEventList(eventList);

        savedSong = songRepository.save(song);

        for (JSMidiEvent jsme : savedSong.getJsMidiEventList()){
            Note note = jsme.getNote();
            note.setJsMidiEvent(jsme);
        }

        return songRepository.save(savedSong);
    }

    public Song findSongBySongId(int id){
        if (songRepository.findBySongId(id) != null){
            System.out.println("Song exists");
            System.out.println(songRepository.findBySongId(id).getJsMidiEventList());
        }
        return songRepository.findBySongId(id);
    }

    public List<Song> findSongsByUserId(int userId){
        List<Song> results = new ArrayList<>();
        return songRepository.findByUserId(userId);
    }

}
