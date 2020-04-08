package com.kevinkerin.midiapp.service;

import com.kevinkerin.midiapp.dal.SongRepository;
import com.kevinkerin.midiapp.exception.ValidationException;
import com.kevinkerin.midiapp.model.Song;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SongService {

    @Autowired
    private SongRepository songRepository;

    public Song saveSong(Song newSong){
        if(newSong.getSongLength() == 0){
            throw new ValidationException("Nothing to save");
        }
        System.out.println("Running new song");
        songRepository.save(newSong);
        return newSong;
    }

    public Song findSongBySongId(int id){
        return songRepository.findBySongId(id);
    }

    public List<Song> findSongsByUserId(int userId){
        List<Song> results = new ArrayList<>();
        return songRepository.findByUserId(userId);
    }

}
