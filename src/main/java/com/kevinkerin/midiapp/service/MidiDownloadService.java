package com.kevinkerin.midiapp.service;

import com.kevinkerin.midiapp.model.JSMidiEvent;
import com.kevinkerin.midiapp.model.Note;
import org.springframework.stereotype.Service;

import javax.sound.midi.*;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
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
            byte[] bt = {0x02, (byte)0x00};
            mt.setMessage(0x51 ,bt, 2);
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

                    Note note = event.getNote();
                    int noteNumber = note.getNumber();
                    mm = new ShortMessage();
                    mm.setMessage(0x90, noteNumber,0x60);
                    me = new MidiEvent(mm, (long) (event.getTimestamp() / (1000/50)));
                    t.add(me);
//                    System.out.println("Short message noteon get channel: " + mm.getChannel());
//                    System.out.println("Short message noteon get command: " + mm.getCommand());
//                    System.out.println("Short message noteon get data1: " + mm.getData1());
//                    System.out.println("Short message noteon get data2: " + mm.getData2());
//                    System.out.println("Short message noteon get length: " + mm.getLength());
//                    System.out.println("Event timestamp: " + event.getTimestamp());
//                    System.out.println("Shouldn't be 0...: " + "Resolution: " + (long) resolution/tempo + ", 1/tempo" + (double) 1/tempo + ", getTimestamp:" + (long) event.getTimestamp());
//                    System.out.println("Shouldn't be 0...: " + (long) resolution * (double) 1/tempo * 10 * event.getTimestamp());
//                    me = new MidiEvent(mm,(long)((long) resolution * (double) 1/tempo * 10 * event.getTimestamp()));
//                    me = new MidiEvent(mm,(long)event.getTimestamp());
//                    System.out.println("MidiEvent get message: " + me.getMessage());
//                    System.out.println("MidiEvent get tick: " + me.getTick());

                } else if(event.getType().equals("noteoff")){

                    Note note = event.getNote();
                    int noteNumber = note.getNumber();
                    mm = new ShortMessage();
                    mm.setMessage(0x80, noteNumber,0x40);
                    me = new MidiEvent(mm, (long) (event.getTimestamp() / (1000/50)));
                    t.add(me);
//                    System.out.println("Short message noteoff get channel: " + mm.getChannel());
//                    System.out.println("Short message noteoff get command: " + mm.getCommand());
//                    System.out.println("Short message noteoff get data1: " + mm.getData1());
//                    System.out.println("Short message noteoff get data2: " + mm.getData2());
//                    System.out.println("Short message noteoff get length: " + mm.getLength());
//                    System.out.println("Event timestamp: " + event.getTimestamp());
//                    System.out.println("Shouldn't be 0...: " + "Resolution: " + (long) resolution + ", Tempo: " + (tempo) + ", 1/tempo" + (double) 1/tempo + ", getTimestamp:" + (long) event.getTimestamp());
//                    System.out.println("Shouldn't be 0...: " + (long) resolution * (double) 1/tempo * 10 * event.getTimestamp());
//                    me = new MidiEvent(mm,(long)((long) resolution * (double) 1/tempo * 10 * event.getTimestamp()));
//                    me = new MidiEvent(mm,(long)event.getTimestamp());
//                    System.out.println("MidiEvent get message: " + me.getMessage());
//                    System.out.println("MidiEvent get tick: " + me.getTick());

                } else if(event.getType().equals("controlchange")){
                    int pedalValue = event.getPedalValue();
                    mm = new ShortMessage();
                    mm.setMessage(ShortMessage.CONTROL_CHANGE, 64, pedalValue);
                    me = new MidiEvent(mm, (long) (event.getTimestamp() / (1000/50)));
                    t.add(me);
                } else {

                }
            }

//****  note on - middle C  ****


//****  note off - middle C - 120 ticks later  ****


//****  set end of track (meta event) 19 ticks later  ****

            double endOfSong = midiEventList.get(midiEventList.size()-1).getTimestamp();
            System.out.println("Last timestamp = " + endOfSong);

            mt = new MetaMessage();
            byte[] bet = {}; // empty array
            mt.setMessage(0x2F,bet,0);
            me = new MidiEvent(mt, (long) endOfSong / (1000/60));
            t.add(me);

            ByteArrayOutputStream output = new ByteArrayOutputStream();
            MidiSystem.write(s,1,output);

            return output.toByteArray();

        } catch(Exception e) {
//            System.out.println("Exception caught " + e.toString());
//            System.out.println("midifile end ");
        } //catch

        return null;

    }

    public String downloadMidiFileBase64(List<JSMidiEvent> midiEventList){
        byte[] result = downloadMidiFile(midiEventList);

        byte[] encodedResult = Base64.getEncoder().encode(result);
        return new String(encodedResult);
    }

}