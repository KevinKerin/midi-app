package com.kevinkerin.midiapp.dal;

import com.kevinkerin.midiapp.model.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface SongRepository extends JpaRepository<Song, Integer> {

    Song findBySongId(int songId);
    @Query("select s from Song s where s.userId = ?1")
    List<Song> findByUserId(int userId);

}
