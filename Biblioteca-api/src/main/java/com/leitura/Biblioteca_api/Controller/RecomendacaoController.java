package com.leitura.Biblioteca_api.Controller;

import com.leitura.Biblioteca_api.dto.RecomendacaoRequest;
import com.leitura.Biblioteca_api.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Permite o React acessar
// NOTA: Retirei o @RequestMapping daqui de cima para evitar "api/api/..."
public class RecomendacaoController {

    private final GeminiService geminiService;

    // ROTA EXPLÍCITA E COMPLETA
    // O React está chamando: http://localhost:8080/api/recomendar
    @PostMapping("/api/recomendar")
public ResponseEntity<String> obterRecomendacao(@RequestBody RecomendacaoRequest request) {
    try {
        System.out.println(">>> 1. Pedido recebido.");
        System.out.println(">>> 2. Mood: " + request.getMood());
        System.out.println(">>> 3. Perfil (Primeiro item): " + (request.getPerfil().isEmpty() ? "Vazio" : request.getPerfil().get(0).toString()));
        
        String recomendacao = geminiService.getRecomendacao(request.getPerfil(), request.getMood());
        
        System.out.println(">>> 4. Sucesso! Resposta gerada.");
        return ResponseEntity.ok(recomendacao);
        
    } catch (Exception e) {
        // Isso vai imprimir o erro REAL no terminal
        e.printStackTrace(); 
        // Isso vai mandar o erro para o frontend (para você ler no console do navegador)
        return ResponseEntity.status(500).body("ERRO DETALHADO: " + e.getMessage() + " | Causa: " + e.getClass().getName());
    }
}
}