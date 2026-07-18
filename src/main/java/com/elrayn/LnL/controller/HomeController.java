package com.elrayn.LnL.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {   
    @GetMapping({"/", "/rooms", "/rooms/create", "/rooms/join", "/rooms/{uuid}",
            "/video", "/activity", "/settings"})
    public String home() {
        return "forward:/app/index.html";
    }
}
