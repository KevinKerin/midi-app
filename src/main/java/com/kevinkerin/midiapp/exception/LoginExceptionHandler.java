package com.kevinkerin.midiapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class LoginExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler (LoginException.class)
    public ResponseEntity<ExceptionResponse> handleLoginException(RuntimeException re, WebRequest wr){
        ExceptionResponse response = new ExceptionResponse(LoginException.class.getName(), re.getMessage());
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

}
