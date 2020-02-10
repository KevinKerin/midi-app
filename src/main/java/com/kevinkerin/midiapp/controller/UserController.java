package com.kevinkerin.midiapp.controller;

import com.kevinkerin.midiapp.model.LoginDetails;
import com.kevinkerin.midiapp.model.User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

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

}
