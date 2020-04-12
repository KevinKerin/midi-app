package com.kevinkerin.midiapp.controller;

import com.kevinkerin.midiapp.dto.UserOutputDTO;
import com.kevinkerin.midiapp.dto.UserRegistrationDTO;
import com.kevinkerin.midiapp.model.LoginDetails;
import com.kevinkerin.midiapp.model.User;
import com.kevinkerin.midiapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    UserService userService;

    @PostMapping("/login")
    public UserOutputDTO login(@RequestBody LoginDetails loginDetails){
        if(userService.loginUser(loginDetails) == null){

        } else {

        }
    }

    @PostMapping("/register")
    public UserOutputDTO register(@RequestBody UserRegistrationDTO newUser){
        UserOutputDTO createdUser = userService.createUser(newUser);
        if(createdUser == null){
            System.out.println("Error in registration");
            return null;
        }

        return createdUser;
    }

}