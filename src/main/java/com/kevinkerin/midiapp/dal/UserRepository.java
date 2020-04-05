package com.kevinkerin.midiapp.dal;

import com.kevinkerin.midiapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {



}