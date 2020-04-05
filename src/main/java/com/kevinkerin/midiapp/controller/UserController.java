package com.kevinkerin.midiapp.controller;

import com.kevinkerin.midiapp.model.LoginDetails;
import com.kevinkerin.midiapp.model.User;
import com.kevinkerin.midiapp.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    UserService userService = new UserService();

    @GetMapping("/{userId}")
    public String getUser(@PathVariable(name="userId") String userId) {
        return "Kevin is a nice boy" +
                " and a very nice boy";
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginDetails ld){
        User user = new User();
        user.setFirstName("Kvin");
        return user;
    }

    @PostMapping
    public User register(@RequestBody User newUser){
        newUser = userService.createUser(newUser);
        if(newUser == null){
            System.out.println("Error in registration");
            return null;
        }
        return newUser;
    }


}
