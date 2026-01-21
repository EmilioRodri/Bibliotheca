package com.leitura.Biblioteca_api.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "*")
public class DebugController {

    @GetMapping("/hello")
    public ResponseEntity<String> sayHello() {
        System.out.println(">>> DEBUG: O servidor está vivo e acessível!");
        return ResponseEntity.ok("Servidor Online e Autenticado!");
    }

    @GetMapping("/json")
    public ResponseEntity<Map<String, String>> sayJson() {
        System.out.println(">>> DEBUG: Testando JSON...");
        Map<String, String> map = new HashMap<>();
        map.put("status", "ok");
        map.put("mensagem", "JSON funcionando");
        return ResponseEntity.ok(map);
    }
}