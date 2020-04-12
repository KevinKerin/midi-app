package com.kevinkerin.midiapp.service;

import com.kevinkerin.midiapp.dal.UserRepository;
import com.kevinkerin.midiapp.dto.UserOutputDTO;
import com.kevinkerin.midiapp.dto.UserRegistrationDTO;
import com.kevinkerin.midiapp.exception.LoginException;
import com.kevinkerin.midiapp.exception.ValidationException;
import com.kevinkerin.midiapp.model.LoginDetails;
import com.kevinkerin.midiapp.model.Session;
import com.kevinkerin.midiapp.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    public static List<User> userList = new ArrayList<>();

    @Autowired
    private UserRepository userRepository;

    public UserOutputDTO createUser(UserRegistrationDTO userRegistrationDTO) throws NoSuchAlgorithmException {
        if(userRegistrationDTO == null){
            throw new ValidationException("New user is null");
        }
        if(StringUtils.isEmpty(userRegistrationDTO.getFirstName())){
            throw new ValidationException("First name field is empty");
        } else if(StringUtils.isEmpty(userRegistrationDTO.getLastName())){
            throw new ValidationException("Last name field is empty");
        } else if(StringUtils.isEmpty(userRegistrationDTO.getEmail())){
            throw new ValidationException("Email field is empty");
        } else if(StringUtils.isEmpty(userRegistrationDTO.getUsername())){
            throw new ValidationException("Username field is empty");
        } else if(StringUtils.isEmpty(userRegistrationDTO.getPassword())){
            throw new ValidationException("Password field is empty");
        }
        if(userRepository.findByEmail(userRegistrationDTO.getEmail()) != null){
            throw new ValidationException("Account already created with this email");
        } else if (userRepository.findByUsername(userRegistrationDTO.getUsername()) != null){
            throw new ValidationException("Username taken");
        }

        User user = convertRegistrationDTO(userRegistrationDTO);
        userRepository.save(user);
        return convertOutputDTO(user);
    }

    private User convertRegistrationDTO(UserRegistrationDTO userRegistrationDTO) throws NoSuchAlgorithmException {
        User user = new User();
        user.setFirstName(userRegistrationDTO.getFirstName());
        user.setLastName(userRegistrationDTO.getLastName());
        user.setUsername(userRegistrationDTO.getUsername());
        user.setEmail(userRegistrationDTO.getEmail());
        user.setPassword(hashPassword(userRegistrationDTO.getPassword()));

        return user;
    }

    private UserOutputDTO convertOutputDTO(User user){
        UserOutputDTO userOutputDTO = new UserOutputDTO();
        userOutputDTO.setFirstName(user.getFirstName());
        userOutputDTO.setLastName(user.getLastName());
        userOutputDTO.setUsername(user.getUsername());
        userOutputDTO.setEmail(user.getEmail());

        return userOutputDTO;
    }

    private String hashPassword(String password) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] encodedhash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
        return bytesToHex(encodedhash);
    }

    private static String bytesToHex(byte[] hash) {
        StringBuffer hexString = new StringBuffer();
        for (int i = 0; i < hash.length; i++) {
            String hex = Integer.toHexString(0xff & hash[i]);
            if(hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    public User findUserByUserId(int id){
        return userRepository.findByUserId(id);
    }

    public User findUserByUsername(String username){
        return userRepository.findByUsername(username);
    }

    public Session loginUser(LoginDetails loginDetails) throws NoSuchAlgorithmException {
        User user = userRepository.findByUsername(loginDetails.getUsername());
        if (user == null) {
            throw new LoginException("Username not found");
        } else {
            if (hashPassword(loginDetails.getPassword()).equals(user.getPassword())){
                Session session = new Session();
                session.
                return convertOutputDTO(user);
            } else {
                throw new LoginException("Incorrect password");
            }
        }
    }

    public User findUserByEmail(String email){
        return userRepository.findByEmail(email);
    }

}