package com.kevinkerin.midiapp.model;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "song")
public class Song {

    @Id @GeneratedValue(strategy = GenerationType.AUTO) @Column(name="songId", unique = true) private int songId;
    @Column(name = "userId", nullable = false) private int userId;
    @Column(name = "songName", nullable = false) private String songName;
    @Column(name = "date", nullable = false) private Date date;
    @Column(name = "length", nullable = false) private int songLength;
    @OneToMany(
            targetEntity = JSMidiEvent.class,
            mappedBy = "song",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<JSMidiEvent> jsMidiEventList = new ArrayList<>();

    public Song() {
    }

//    Table of Users
//    Table of Songs with primary key songId
//    Table of JSMidiEvents containing each event, with a songId linked to each MidiEvent
//    Each song has its own songId referencing the JSMidiEvents

    public Song(List<JSMidiEvent> jsMidiEventList, String songName, int userId) {
        this.jsMidiEventList = jsMidiEventList;
        this.songName = songName;
        this.date = new Date();
        this.userId = userId;
        this.songLength = jsMidiEventList.size();
    }

    public Song(List<JSMidiEvent> jsMidiEventList, int userId) {
        this.jsMidiEventList = jsMidiEventList;
        this.date = new Date();
        this.songName = "New Song";
        this.userId = userId;
        this.songLength = jsMidiEventList.size();
    }

    public int getSongLength(){
        return this.songLength;
    }

    public int getSongId() {
        return songId;
    }

    public List<JSMidiEvent> getSongEvents(){
        return jsMidiEventList;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public void addJSMidiEvent(JSMidiEvent jsme){
        this.jsMidiEventList.add(jsme);
    }

    public String getSongName() {
        return songName;
    }

    public void setSongName(String name) {
        this.songName = name;
    }

}