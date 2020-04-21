package com.kevinkerin.midiapp.service;

import com.kevinkerin.midiapp.dal.SessionRepository;
import com.kevinkerin.midiapp.dal.SongRepository;
import com.kevinkerin.midiapp.dal.UserRepository;
import com.kevinkerin.midiapp.exception.AuthorizationException;
import com.kevinkerin.midiapp.exception.NotFoundException;
import com.kevinkerin.midiapp.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class SongService {

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    public Song saveSong(Song song, String token){
        Integer userId = getUserIdByToken(token);
        song.setUserId(userId);
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
            if(jsme.getType().equals("noteon") || jsme.getType().equals("noteoff")){
                Note note = jsme.getNote();
                note.setJsMidiEvent(jsme);
            } else if (jsme.getType().equals("controlchange")){
                Controller controller = jsme.getController();
                controller.setJsMidiEvent(jsme);
            }
        }

        return songRepository.save(savedSong);
    }

    public Song findSongBySongId(int id, String token){
        Integer userId = getUserIdByToken(token);

        Song song = songRepository.findBySongId(id);
        if(song.getUserId() == userId){
            return song;
        } else {
            throw new AuthorizationException("Access denied");
        }
    }

    public List<Song> findSongsByUserId(String token){
        Integer userId = getUserIdByToken(token);
        return songRepository.findByUserId(userId);
    }

    private Integer getUserIdByToken(String token){
        Session session = sessionRepository.findByToken(token);
        if (session == null){
            throw new AuthorizationException("Access denied");
        }
        if(session.getUserId() == null){
            throw new AuthorizationException("Access denied");
        }
        long currentTimeInSeconds = new Date().getTime() / 1000L;
        if(currentTimeInSeconds > session.getExpiry()){
            throw new AuthorizationException("Session expired");
        }
        if (userRepository.findByUserId(session.getUserId()) == null){
            throw new NotFoundException("User not found");
        }
        return session.getUserId();
    }

    public void deleteSongBySongId(Integer songId, String token){
        Session session = sessionRepository.findByToken(token);
        if(session == null){
            return;
        }
        Integer userId = session.getUserId();
        Song song = findSongBySongId(songId, token);
        if(song.getUserId() == userId){
            songRepository.delete(song);
        }
    }

}
