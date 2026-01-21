package com.leitura.Biblioteca_api.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Ignora erros de arquivos estáticos (favicon, imagens)
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Void> handleNoResource(NoResourceFoundException e) {
        return ResponseEntity.notFound().build();
    }

    // Captura erros reais do sistema
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        // Loga o erro no terminal para você ver
        System.out.println("=================================");
        System.out.println("ERRO 500 REAL CAPTURADO:");
        e.printStackTrace();
        System.out.println("=================================");

        Map<String, String> response = new HashMap<>();
        response.put("error", "Erro Interno no Servidor");
        response.put("message", e.getMessage());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}