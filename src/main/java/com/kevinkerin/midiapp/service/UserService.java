package com.kevinkerin.midiapp.service;

import com.kevinkerin.midiapp.dal.UserRepository;
import com.kevinkerin.midiapp.exception.ValidationException;
import com.kevinkerin.midiapp.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    public static List<User> userList = new ArrayList<>();

    @Autowired
    private UserRepository userRepository;

    public User createUser(User newUser){
        if(newUser == null){
            throw new ValidationException("New user is null");
        }
        if(StringUtils.isEmpty(newUser.getFirstName())){
            throw new ValidationException("First name field is empty");
        } else if(StringUtils.isEmpty(newUser.getLastName())){
            throw new ValidationException("Last name field is empty");
        } else if(StringUtils.isEmpty(newUser.getEmail())){
            throw new ValidationException("Email field is empty");
        } else if(StringUtils.isEmpty(newUser.getUsername())){
            throw new ValidationException("Username field is empty");
        } else if(StringUtils.isEmpty(newUser.getPassword())){
            throw new ValidationException("Password field is empty");
        }
        if(userRepository.findByEmail(newUser.getEmail()) != null){
            throw new ValidationException("Account already created with this email");
        } else if (userRepository.findByUsername(newUser.getUsername()) != null){
            throw new ValidationException("Username taken");
        }

//userList.add(newUser);
        userRepository.save(newUser);
        return newUser;
    }
}

