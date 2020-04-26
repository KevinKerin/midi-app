package com.kevinkerin.midiapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;

@Entity
@Table(name="jsmidievent")
public class JSMidiEvent {

//    JSMidiEvent is either of type noteon, noteoff, or controlchange
//    Constitutes one event in a list of JSMidiEvents within a song created by the user
//    Timestamp ensures correct order and spacing between events during playback
//    Velocity is only used in noteon cases to denote how strong the key has been pressed
//    Note class is only ued in noteon or noteoff cases
//    Sustain pedal pushes will initialise a new Controller object

    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "eventId", nullable = false) private Integer eventId;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="songId") @JsonIgnore private Song song;
    @Column(name = "channel", nullable = false) private Integer channel;
    @Column(name = "type", nullable = false) private String type;
    @Column(name = "timestamp", nullable = false) private double timestamp;
    @Column(name = "velocity") private Double velocity;
    @OneToOne(cascade=CascadeType.ALL, targetEntity = Note.class, mappedBy = "jsMidiEvent") private Note note;
    @OneToOne(cascade = CascadeType.ALL, targetEntity = Controller.class, mappedBy = "jsMidiEvent") private Controller controller;
    @Column(name = "value") private Integer value;

    public void setSong(Song song) { this.song = song; }

    public Song getSong() { return song; }

    public Integer getValue() {
        return value;
    }

    public void setValue(Integer pedalValue) {
        this.value = pedalValue;
    }

    public Integer getChannel() {
        return channel;
    }

    public void setChannel(Integer channel) {
        this.channel = channel;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getVelocity() {
        return velocity;
    }

    public void setVelocity(Double velocity) {
        this.velocity = velocity;
    }

    public double getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(double timestamp) {
        this.timestamp = timestamp;
    }

    public Controller getController() {
        return controller;
    }

    public void setController(Controller controller) {
        this.controller = controller;
    }

    public Note getNote() {
        return note;
    }

    public void setNote(Note note) {
        this.note = note;
    }

    @Override
    public String toString() {
        return "JSMidiEvent{" +
                "eventId=" + eventId +
                "channel=" + channel +
                ", type='" + type + '\'' +
                ", timestamp=" + timestamp +
                ", velocity=" + velocity +
                ", note=" + note +
                ", pedalValue=" + value +
                '}';
    }
}