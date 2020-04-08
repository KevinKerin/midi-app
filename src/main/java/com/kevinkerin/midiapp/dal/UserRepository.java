package com.kevinkerin.midiapp.dal;

import com.kevinkerin.midiapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

@Component
public interface UserRepository extends JpaRepository<User, Integer> {

        User findByEmail(String email);
        User findByUsername(String username);
        User findByUserId(int id);

}