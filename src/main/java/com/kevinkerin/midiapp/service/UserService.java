package com.kevinkerin.midiapp.service;

import com.kevinkerin.midiapp.dal.SessionRepository;
import com.kevinkerin.midiapp.dal.UserRepository;
import com.kevinkerin.midiapp.dto.*;
import com.kevinkerin.midiapp.exception.AuthorizationException;
import com.kevinkerin.midiapp.exception.LoginException;
import com.kevinkerin.midiapp.exception.NotFoundException;
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
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionRepository sessionRepository;

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
        if(user == null){
            return null;
        }
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

    public UserOutputDTO findUserByUserId(int id){
        return convertOutputDTO(userRepository.findByUserId(id));
    }

    public UserOutputDTO findUserByUsername(String username){
        return convertOutputDTO(userRepository.findByUsername(username));
    }

    public TokenDTO loginUser(LoginDetails loginDetails) throws NoSuchAlgorithmException {
        User user = userRepository.findByUsername(loginDetails.getUsername());
        if (user == null) {
            throw new LoginException("Username not found");
        } else {
            if (hashPassword(loginDetails.getPassword()).equals(user.getPassword())){
                Session session = new Session();
                session.setUserId(user.getUserId());
                session.setToken(UUID.randomUUID().toString());
                session.setExpiry(((new Date()).getTime() / 1000L) + 604800);
                TokenDTO tokenDTO = new TokenDTO();
                tokenDTO.setToken(session.getToken());
                sessionRepository.save(session);
                return tokenDTO;
            } else {
                throw new LoginException("Incorrect password");
            }
        }
    }

    public UserOutputDTO updateUserDetails(UserUpdateDTO userUpdateDTO, String token) throws NoSuchAlgorithmException {
        if(userUpdateDTO == null){
            throw new ValidationException("Updated user is null");
        }
        if(StringUtils.isEmpty(userUpdateDTO.getFirstName())){
            throw new ValidationException("First name field is empty");
        } else if(StringUtils.isEmpty(userUpdateDTO.getLastName())){
            throw new ValidationException("Last name field is empty");
        } else if(StringUtils.isEmpty(userUpdateDTO.getPassword())){
            throw new ValidationException("Password field is empty");
        }

        Session session = sessionRepository.findByToken(token);

        User user = userRepository.findByUserId(session.getUserId());
        if(!hashPassword(userUpdateDTO.getPassword()).equals(user.getPassword())){
            throw new AuthorizationException("Incorrect password");
        }
        user.setFirstName(userUpdateDTO.getFirstName());
        user.setLastName(userUpdateDTO.getLastName());
        userRepository.save(user);
        return convertOutputDTO(user);
    }

    public UserOutputDTO changePassword(PasswordUpdateDTO passwordUpdateDTO, String token) throws NoSuchAlgorithmException {
        if(passwordUpdateDTO == null){
            throw new ValidationException("PasswordUpdateDTO is null");
        }
        if(StringUtils.isEmpty(passwordUpdateDTO.getCurrentPassword())){
            throw new ValidationException("Current password field empty");
        } else if(StringUtils.isEmpty(passwordUpdateDTO.getNewPassword())){
            throw new ValidationException("New password field empty");
        } else if(StringUtils.isEmpty(passwordUpdateDTO.getNewPasswordConfirm())){
            throw new ValidationException("Confirm new password field empty");
        } else if(!passwordUpdateDTO.getNewPassword().equals(passwordUpdateDTO.getNewPasswordConfirm())){
            throw new ValidationException("Passwords don't match");
        }

        Session session = sessionRepository.findByToken(token);

        User user = userRepository.findByUserId(session.getUserId());
        if(!hashPassword(passwordUpdateDTO.getCurrentPassword()).equals(user.getPassword())){
            throw new AuthorizationException("Incorrect password");
        }
        user.setPassword(hashPassword(passwordUpdateDTO.getNewPasswordConfirm()));
        userRepository.save(user);
        return convertOutputDTO(user);
    }

    public User findUserByEmail(String email){
        return userRepository.findByEmail(email);
    }

    public Session findSessionByToken(String token){
        return sessionRepository.findByToken(token);
    }

    public void deleteSessionByToken(String token){
        Session session = sessionRepository.findByToken(token);
        if(session == null){
            return;
        }
        sessionRepository.delete(session);
    }


}