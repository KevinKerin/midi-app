package com.kevinkerin.midiapp.controller;

import com.kevinkerin.midiapp.dto.*;
import com.kevinkerin.midiapp.exception.AuthorizationException;
import com.kevinkerin.midiapp.model.LoginDetails;
import com.kevinkerin.midiapp.model.Session;
import com.kevinkerin.midiapp.model.User;
import com.kevinkerin.midiapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.NoSuchAlgorithmException;
import java.util.Date;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public TokenDTO login(@RequestBody LoginDetails loginDetails) throws NoSuchAlgorithmException {
        return userService.loginUser(loginDetails);
    }

    @PostMapping("/register")
    public UserOutputDTO register(@RequestBody UserRegistrationDTO newUser) throws NoSuchAlgorithmException {
        UserOutputDTO createdUser = userService.createUser(newUser);
        if(createdUser == null){
            System.out.println("Error in registration");
            return null;
        }

        return createdUser;
    }

    @GetMapping("/info")
    public UserOutputDTO getUser(@RequestHeader ("X-Token") String token) {
        Session session = userService.findSessionByToken(token);
        if(session == null){
            throw new AuthorizationException("User access denied");
        }
        long currentTimeInSeconds = new Date().getTime() / 1000L;
        if(currentTimeInSeconds > session.getExpiry()){
            throw new AuthorizationException("Session expired");
        }
        return userService.findUserByUserId(session.getUserId());
    }

    @GetMapping("/logout")
    public void logout(@RequestHeader ("X-Token") String token) {
        userService.deleteSessionByToken(token);
    }

    @PostMapping("/update")
    public UserOutputDTO updateUserDetails(@RequestHeader ("X-Token") String token, @RequestBody UserUpdateDTO userUpdateDTO) throws NoSuchAlgorithmException {
        return userService.updateUserDetails(userUpdateDTO, token);
    }

    @PostMapping("/changepassword")
    public UserOutputDTO updateUserPassword(@RequestHeader ("X-Token") String token, @RequestBody PasswordUpdateDTO passwordUpdateDTO) throws NoSuchAlgorithmException {
        return userService.changePassword(passwordUpdateDTO, token);
    }

}