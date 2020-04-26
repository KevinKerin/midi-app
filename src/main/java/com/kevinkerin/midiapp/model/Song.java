package com.kevinkerin.midiapp.model;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "song")
public class Song {

//    Song class will contain a list of JSMidiEvents, each containing its own ID

    @Id @GeneratedValue(strategy = GenerationType.AUTO) @Column(name="songId", unique = true) private int songId;
    @Column(name = "userId", nullable = false) private int userId;
    @Column(name = "songName", nullable = false) private String songName;
    @Column(name = "date", nullable = false) private Date date;
    @Column(name = "length", nullable = false) private long songLength;
    @OneToMany(
            targetEntity = JSMidiEvent.class,
            mappedBy = "song",
            cascade = CascadeType.ALL
    )
    private List<JSMidiEvent> jsMidiEventList;

    public Song() {
    }

    public Song(List<JSMidiEvent> jsMidiEventList, String songName, int userId) {
        this.jsMidiEventList = jsMidiEventList;
        this.songName = songName;
        this.date = new Date();
        this.userId = userId;
    }

    public long getSongLength(){
        double firstTimestamp = jsMidiEventList.get(0).getTimestamp();
        double lastTimestamp = jsMidiEventList.get(jsMidiEventList.size()-1).getTimestamp();
        return Math.round(lastTimestamp - firstTimestamp);
    }

    public int getSongId() {
        return songId;
    }

    public void setJsMidiEventList(List<JSMidiEvent> jsMidiEventList) {
        this.jsMidiEventList = jsMidiEventList;
    }

    public List<JSMidiEvent> getJsMidiEventList(){
        return jsMidiEventList;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
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
        String result = "" + getSongLength() + " " + jsMidiEventList.size() + "\n";
        for (JSMidiEvent jsme : jsMidiEventList){
            result += jsme + "\n";
        }
        return result;
    }

}