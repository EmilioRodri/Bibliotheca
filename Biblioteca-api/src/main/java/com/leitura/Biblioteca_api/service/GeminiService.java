package com.leitura.Biblioteca_api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKeyRaw;

    // VOLTAMOS PARA O 2.5 (O ÚNICO QUE SUA CHAVE ACEITA)
    private final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    public String getRecomendacao(Object perfil, String mood) throws IOException {
        
        if (apiKeyRaw == null) throw new IOException("API Key é nula!");
        String apiKey = apiKeyRaw.trim(); 

        System.out.println(">>> CONECTANDO AO GEMINI 2.5 (Tentativa com Retry)...");

        String promptTexto = "Atue como bibliotecário. Mood: " + mood + ". " +
                             "Histórico: " + perfil.toString() + ". " +
                             "Recomende 4 livros. " +
                             "Responda EXATAMENTE este JSON puro: " +
                             "{ \"motivoGeral\": \"texto\", \"recomendacoes\": [ { \"titulo\": \"Titulo\", \"autor\": \"Autor\", \"urlCapa\": \"\", \"motivoRecomendacao\": \"texto\" } ] }";

        String jsonSafePrompt = promptTexto.replace("\"", "'").replace("\n", " ");
        String requestBody = "{ \"contents\": [{ \"parts\": [{ \"text\": \"" + jsonSafePrompt + "\" }] }] }";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "?key=" + apiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        // TENTATIVA 1
        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // SE DER 503 (Serviço Indisponível), TENTA DE NOVO UMA VEZ
            if (response.statusCode() == 503) {
                System.out.println(">>> 503 DETECTADO. AGUARDANDO 2 SEGUNDOS PARA TENTAR DE NOVO...");
                Thread.sleep(2000); 
                response = client.send(request, HttpResponse.BodyHandlers.ofString());
            }

            if (response.statusCode() != 200) {
                System.out.println("!!! ERRO GOOGLE !!! STATUS: " + response.statusCode());
                System.out.println("BODY: " + response.body());
                throw new IOException("Erro API Google: " + response.statusCode());
            }

            String responseBody = response.body();
            int startIndex = responseBody.indexOf("\"text\": \"");
            
            if (startIndex != -1) {
                String texto = responseBody.substring(startIndex + 9);
                // Lógica robusta para achar o fim do JSON
                int endIndex = texto.lastIndexOf("}"); 
                // Se o lastIndexOf pegar o fecha chave do JSON externo, ajustamos
                if (endIndex > texto.lastIndexOf("\"")) { 
                     // Procura a aspa de fechamento do campo text
                     endIndex = texto.indexOf("\"\n");
                     if (endIndex == -1) endIndex = texto.lastIndexOf("\"", texto.length() - 5);
                }

                if (endIndex != -1) texto = texto.substring(0, endIndex);
                
                texto = texto.replace("\\n", " ").replace("\\\"", "\"").replace("\\r", "");
                
                if (texto.startsWith("```json")) texto = texto.substring(7);
                if (texto.startsWith("```")) texto = texto.substring(3);
                if (texto.endsWith("```")) texto = texto.substring(0, texto.length() - 3);
                
                return texto.trim();
            } else {
                 return responseBody;
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Conexão interrompida.");
        }
    }
}