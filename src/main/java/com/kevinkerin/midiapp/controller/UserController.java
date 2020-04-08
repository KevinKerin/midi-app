package com.kevinkerin.midiapp.controller;

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

    @GetMapping("/{userId}")
    public User getUser(@PathVariable(name="userId") int userId) {
        User user = userService.findUserByUserId(userId);
        if(user == null){
            return null;
        }
        return user;
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginDetails ld){
        User user = new User();
        user.setFirstName("Kvin");
        return user;
    }

    @PostMapping("/register")
    public User register(@RequestBody User newUser){
        newUser = userService.createUser(newUser);
        if(newUser == null){
            System.out.println("Error in registration");
            return null;
        }
        return newUser;
    }

}