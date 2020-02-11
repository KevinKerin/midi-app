package com.kevinkerin.midiapp.service;

import com.kevinkerin.midiapp.model.JSMidiEvent;
import org.springframework.stereotype.Service;

import javax.sound.midi.*;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class MidiDownloadService {

    public byte[] downloadMidiFile(List<JSMidiEvent> JSMidiEvent){
        int tempo = 60;
        String trackName = "Bohemian Rhapsody";
        String fileName = "bohemian-rhapsody.mid";

        System.out.println("midifile begin ");
        try {
//****  Create a new MIDI sequence with 24 ticks per beat  ****
            Sequence s = new Sequence(javax.sound.midi.Sequence.PPQ,24);

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
            me = new MidiEvent(mt,(long)0);
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

//****  note on - middle C  ****
            mm = new ShortMessage();
            mm.setMessage(0x90,0x3C,0x60);
            mm.setMessage(0x90,60,0x60);
            me = new MidiEvent(mm,(long)1);
            t.add(me);

//****  note off - middle C - 120 ticks later  ****
            mm = new ShortMessage();
            mm.setMessage(0x80,0x3C,0x40);
            me = new MidiEvent(mm,(long)121);
            t.add(me);

//****  set end of track (meta event) 19 ticks later  ****
            mt = new MetaMessage();
            byte[] bet = {}; // empty array
            mt.setMessage(0x2F,bet,0);
            me = new MidiEvent(mt, (long)140);
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