package com.kevinkerin.midiapp.dal;

import com.kevinkerin.midiapp.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface SongRepository extends JpaRepository<Song, Integer> {

    Song findBySongId(int songId);
    List<Song> findByUserId(int userId);

}
