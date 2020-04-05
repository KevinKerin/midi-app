package com.kevinkerin.midiapp.service;

import com.kevinkerin.midiapp.exception.ValidationException;
import com.kevinkerin.midiapp.model.User;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class UserService {

    public static List<User> userList = new ArrayList<>();

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
for (User user : userList){
if(newUser.getEmail().equalsIgnoreCase(user.getEmail())){
    System.out.println("Account already created with this email address");
    return null;
} else if (newUser.getUsername().equalsIgnoreCase(user.getUsername())){
    System.out.println("Username taken");
    return null;
}
}
userList.add(newUser);
return newUser;
}
}