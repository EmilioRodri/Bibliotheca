package com.leitura.Biblioteca_api.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper;
    private final HttpClient client;

    public GeminiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.client = HttpClient.newHttpClient(); // Reutilizando a mesma instância de client para melhor performance
    }

    // ---------------------------------------------------------
    // Módulo 1: O Oráculo (Recomendação de Livros)
    // ---------------------------------------------------------
    public String getRecomendacao(Object perfil, String mood) throws IOException {
        
        String finalApiKey = (apiKey != null && !apiKey.contains("${")) ? apiKey : "AIzaSyCOJWBdsn4Ls1mabOfj_G2dDBVDS0273u8";
        finalApiKey = finalApiKey.trim();
        
        String finalModel = "gemini-3.1-flash-lite";
        String urlString = "https://generativelanguage.googleapis.com/v1beta/models/" + finalModel + ":generateContent?key=" + finalApiKey;

        log.info("### Invocando o Oráculo via: {} ###", finalModel);

        String historico = (perfil != null) ? perfil.toString() : "Nenhuma preferência registrada ainda.";

        String promptTexto = String.format(
            "Você é um curador literário experiente do canal 'Cânone das Sombras'.\n" +
            "OBJETIVO: Recomendar 4 obras brilhantes para o leitor.\n\n" +
            "REGRAS:\n" +
            "1. Retorne APENAS o JSON.\n" +
            "2. No campo 'urlCapa', deixe uma string vazia \"\" (o sistema buscará a imagem depois).\n" +
            "3. Escolha livros que combinem com o Mood: %s e Histórico: %s.\n\n" +
            "FORMATO JSON:\n" +
            "{ \"motivoGeral\": \"...\", \"recomendacoes\": [ { \"titulo\": \"...\", \"autor\": \"...\", \"urlCapa\": \"\", \"motivoRecomendacao\": \"...\" } ] }",
            mood, historico
        );

        return invocarGemini(urlString, promptTexto, true);
    }

    // ---------------------------------------------------------
    // Módulo 2: O Roteirista (YouTube Helper / Textos Livres)
    // ---------------------------------------------------------
    public String consultarIA(String promptTexto) throws IOException {
        
        String finalApiKey = (apiKey != null && !apiKey.contains("${")) ? apiKey : "AIzaSyCOJWBdsn4Ls1mabOfj_G2dDBVDS0273u8";
        finalApiKey = finalApiKey.trim();
        
        String finalModel = "gemini-3.1-flash-lite";
        String urlString = "https://generativelanguage.googleapis.com/v1beta/models/" + finalModel + ":generateContent?key=" + finalApiKey;

        log.info("### Invocando a IA para Geração de Roteiro via: {} ###", finalModel);

        // O boolean false indica que não vamos forçar o retorno em JSON (responseMimeType), 
        // pois o roteiro é um texto livre (Markdown).
        return invocarGemini(urlString, promptTexto, false);
    }

    // ---------------------------------------------------------
    // Motor Central de Comunicação HTTP
    // ---------------------------------------------------------
    private String invocarGemini(String urlString, String promptTexto, boolean forcarJson) throws IOException {
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", promptTexto);
        
        Map<String, Object> contentPart = new HashMap<>();
        contentPart.put("parts", List.of(textPart));
        
        Map<String, Object> requestBodyMap = new HashMap<>();
        requestBodyMap.put("contents", List.of(contentPart));

        if (forcarJson) {
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");
            requestBodyMap.put("generationConfig", generationConfig);
        }

        String requestBody = objectMapper.writeValueAsString(requestBodyMap);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(urlString))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Erro Google! Status: {} | Body: {}", response.statusCode(), response.body());
                throw new IOException("O Google recusou o chamado. Status: " + response.statusCode());
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            
            JsonNode candidates = rootNode.path("candidates");
            if (candidates.isMissingNode() || candidates.isEmpty()) {
                throw new IOException("Resposta vazia do Google.");
            }

            String textoGerado = candidates.get(0)
                                          .path("content")
                                          .path("parts")
                                          .get(0)
                                          .path("text")
                                          .asText();
            
            return limparMarkdownJson(textoGerado);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Conexão interrompida.", e);
        }
    }

    private String limparMarkdownJson(String texto) {
        String limpo = texto.trim();
        if (limpo.startsWith("```")) {
            // Remove as marcações de código Markdown (```json, ```html, ```, etc)
            limpo = limpo.replaceAll("```[a-zA-Z]*\\n|```", "").trim();
        }
        return limpo;
    }
}