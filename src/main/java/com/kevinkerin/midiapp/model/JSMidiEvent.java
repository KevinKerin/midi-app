package com.kevinkerin.midiapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;

@Entity
@Table(name="jsmidievent")
public class JSMidiEvent {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "eventId", nullable = false) private Integer eventId;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="songId") @JsonIgnore private Song song;
    @Column(name = "channel", nullable = false) private Integer channel;
    @Column(name = "type", nullable = false) private String type;
    @Column(name = "timestamp", nullable = false) private double timestamp;
    @Column(name = "velocity") private Double velocity;
    @OneToOne(cascade=CascadeType.ALL, targetEntity = Note.class, mappedBy = "jsMidiEvent") private Note note;
    @Column(name = "pedalValue") private Integer pedalValue;

    public void setSong(Song song) { this.song = song; }

    public Song getSong() { return song; }

    public Integer getPedalValue() {
        return pedalValue;
    }

    public void setPedalValue(Integer pedalValue) {
        this.pedalValue = pedalValue;
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
                ", pedalValue=" + pedalValue +
                '}';
    }
}