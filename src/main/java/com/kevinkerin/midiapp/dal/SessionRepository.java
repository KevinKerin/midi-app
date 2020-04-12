package com.kevinkerin.midiapp.dal;

import com.kevinkerin.midiapp.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

@Component
public interface SessionRepository extends JpaRepository<Session, Long> {

    Session findByToken(String token);

}