package com.kevinkerin.midiapp.model;

import javax.persistence.*;

@Entity
@Table(name = "user")
public class User {

    @Id @GeneratedValue(strategy = GenerationType.AUTO) @Column(name="userId", unique = true) private int userId;
    @Column(name = "firstName", nullable = false) private String firstName;
    @Column(name = "lastName", nullable = false) private String lastName;
    @Column(name = "email", nullable = false) private String email;
    @Column(name = "username", nullable = false) private String username;
    @Column(name = "password", nullable = false) private String password;

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}