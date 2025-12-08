package com.elrayn.LnL.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/video-session")
public class VideoSessionController {

    @GetMapping("/enter") 
    public String startVideoSession(HttpSession session) {
        return "videochat";
    }
    
}
