package com.kevinkerin.midiapp.model;


import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;

@Entity
@Table(name = "controller")
public class Controller {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO) @Column(name="id", unique = true) private int id;
    @OneToOne(cascade=CascadeType.ALL, fetch=FetchType.LAZY) @JoinColumn(name="jsMidiEventId") @JsonIgnore
    private JSMidiEvent jsMidiEvent;
    @Column(name = "number", nullable = false) private Integer number;
    @Column(name = "name", nullable = false) private String name;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public JSMidiEvent getJsMidiEvent() {
        return jsMidiEvent;
    }

    public void setJsMidiEvent(JSMidiEvent jsMidiEvent) {
        this.jsMidiEvent = jsMidiEvent;
    }

    public Integer getNumber() {
        return number;
    }

    public void setNumber(Integer number) {
        this.number = number;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
