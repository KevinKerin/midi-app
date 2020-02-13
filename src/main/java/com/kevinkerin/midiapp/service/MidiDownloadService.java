package com.kevinkerin.midiapp.service;

import com.kevinkerin.midiapp.model.JSMidiEvent;
import org.springframework.stereotype.Service;

import javax.sound.midi.*;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class MidiDownloadService {

    public double tickGenerator(int tempo, int resolution, double timestamp){
        return resolution * tempo * 1000 * timestamp;
    }

    public byte[] downloadMidiFile(List<JSMidiEvent> midiEventList){

        int tempo = 80;
        String trackName = "Bohemian Rhapsody";
        String fileName = "bohemian-rhapsody.mid";

        System.out.println("midifile begin ");
        try {
//****  Create a new MIDI sequence with 48 ticks per beat  ****
            Sequence s = new Sequence(javax.sound.midi.Sequence.PPQ,24);
            int resolution = s.getResolution();
//****  Obtain a MIDI track from the sequence  ****
            Track t = s.createTrack();

//****  General MIDI sysex -- turn on General MIDI sound set  ****
            byte[] b = {(byte)0xF0, 0x7E, 0x7F, 0x09, 0x01, (byte)0xF7};
            SysexMessage sm = new SysexMessage();
            sm.setMessage(b, 6);
            MidiEvent me = new MidiEvent(sm,(long)0);
            t.add(me);

//****  set tempo (meta event)  ****
            MetaMessage mt = new MetaMessage();
            byte[] bt = {0x02, (byte)0x00, 0x00};
            mt.setMessage(0x51 ,bt, 3);
            me = new MidiEvent(mt,(long)80);
            t.add(me);

//****  set track name (meta event)  ****
            mt = new MetaMessage();
            mt.setMessage(0x03 ,trackName.getBytes(), trackName.length());
            me = new MidiEvent(mt,(long)0);
            t.add(me);

//****  set omni on  ****
            ShortMessage mm = new ShortMessage();
            mm.setMessage(0xB0, 0x7D,0x00);
            me = new MidiEvent(mm,(long)0);
            t.add(me);

//****  set poly on  ****
            mm = new ShortMessage();
            mm.setMessage(0xB0, 0x7F,0x00);
            me = new MidiEvent(mm,(long)0);
            t.add(me);

//****  set instrument to Piano  ****
            mm = new ShortMessage();
            mm.setMessage(0xC0, 0x00, 0x00);
            me = new MidiEvent(mm,(long)0);
            t.add(me);

            for (JSMidiEvent event : midiEventList){
                if(event.getType().equals("noteon")){

                    int noteNumber = event.getNoteNumber();
                    mm = new ShortMessage();
                    mm.setMessage(0x90,noteNumber,0x60);
                    System.out.println("Short message noteon get channel: " + mm.getChannel());
                    System.out.println("Short message noteon get command: " + mm.getCommand());
                    System.out.println("Short message noteon get data1: " + mm.getData1());
                    System.out.println("Short message noteon get data2: " + mm.getData2());
                    System.out.println("Short message noteon get length: " + mm.getLength());
                    System.out.println("Event timestamp: " + event.getTimestamp());
                    me = new MidiEvent(mm,(long) resolution * (1/tempo) * 1000 * (long) event.getTimestamp());
//                    me = new MidiEvent(mm,(long)event.getTimestamp());
                    System.out.println("MidiEvent get message: " + me.getMessage());
                    System.out.println("MidiEvent get tick: " + me.getTick());
                    t.add(me);

                } else if(event.getType().equals("noteoff")){

                    int noteNumber = event.getNoteNumber();
                    mm = new ShortMessage();
                    mm.setMessage(0x80,noteNumber,0x40);
                    System.out.println("Short message noteoff get channel: " + mm.getChannel());
                    System.out.println("Short message noteoff get command: " + mm.getCommand());
                    System.out.println("Short message noteoff get data1: " + mm.getData1());
                    System.out.println("Short message noteoff get data2: " + mm.getData2());
                    System.out.println("Short message noteoff get length: " + mm.getLength());
                    System.out.println("Event timestamp: " + event.getTimestamp());
                    me = new MidiEvent(mm,(long) resolution * (1/tempo) * 1000 * (long) event.getTimestamp());
//                    me = new MidiEvent(mm,(long)event.getTimestamp());
                    System.out.println("MidiEvent get message: " + me.getMessage());
                    System.out.println("MidiEvent get tick: " + me.getTick());
                    t.add(me);

                } else if(event.getType().equals("controlchange")){

                } else {

                }
            }

//****  note on - middle C  ****


//****  note off - middle C - 120 ticks later  ****


//****  set end of track (meta event) 19 ticks later  ****
            mt = new MetaMessage();
            byte[] bet = {}; // empty array
            mt.setMessage(0x2F,bet,0);
            me = new MidiEvent(mt, (long)14000);
            t.add(me);

            ByteArrayOutputStream output = new ByteArrayOutputStream();
            MidiSystem.write(s,1,output);

            return output.toByteArray();

        } catch(Exception e) {
            System.out.println("Exception caught " + e.toString());
            System.out.println("midifile end ");
        } //catch

        return null;

    }

} //midifile