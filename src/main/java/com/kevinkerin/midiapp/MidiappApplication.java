package com.kevinkerin.midiapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@EntityScan
@SpringBootApplication
public class MidiappApplication {

	public static void main(String[] args) {
		SpringApplication.run(MidiappApplication.class, args);
	}

}