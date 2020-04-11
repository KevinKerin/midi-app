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

//    public static void main(String[] args) {
//        List<JSMidiEvent> eventList = new ArrayList<>();
//        for (int i = 0; i < 20; i++) {
//            JSMidiEvent jsme = new JSMidiEvent();
//            jsme.setChannel(1);
//            jsme.setNoteNumber(50);
//            jsme.setType("noteon");
//            jsme.setTimestamp(500);
//            jsme.setVelocity(0.5);
//            eventList.add(jsme);
//        }
//        Song song = new Song(eventList, "Testy test test", 1);
//
//        System.out.println(song.getSongEvents());
//        System.out.println(song);
//    }

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

    public String toString(){
        String result = "";
        for (JSMidiEvent jsme : jsMidiEventList){
            result += jsme + "\n";
        }
        return result;
    }

}