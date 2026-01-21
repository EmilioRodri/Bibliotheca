package com.leitura.Biblioteca_api.Controller;

import com.leitura.Biblioteca_api.dto.AuthRequest;
import com.leitura.Biblioteca_api.dto.AuthResponse;
import com.leitura.Biblioteca_api.dto.SignUpRequest;
import com.leitura.Biblioteca_api.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignUpRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.signin(request));
    }
}