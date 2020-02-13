package com.kevinkerin.midiapp.model;

public class JSMidiEvent {

    private Integer channel;
    private String type;
    private double timestamp;
    private Double velocity;
    private Integer noteNumber;

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

    public Integer getNoteNumber() {
        return noteNumber;
    }

    public void setNoteNumber(Integer noteNumber) {
        this.noteNumber = noteNumber;
    }

    @Override
    public String toString() {
        return "JSMidiEvent{" +
                "channel=" + channel +
                ", type='" + type + '\'' +
                ", timestamp=" + timestamp +
                ", velocity=" + velocity +
                ", noteNumber=" + noteNumber +
                '}';
    }
}