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
    public String getUser(@PathVariable(name="userId") String userId) {
        return "Kevin is a nice boy" +
                " and a very nice boy";
    }

    @GetMapping


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