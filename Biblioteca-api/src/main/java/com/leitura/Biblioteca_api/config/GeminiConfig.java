package com.leitura.Biblioteca_api.config;

import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class GeminiConfig {

    @Value("${gemini.project-id}")
    private String projectId;

    @Value("${gemini.location}")
    private String location;

    @Value("${gemini.model-name}")
    private String modelName;

    @Bean
    public VertexAI vertexAI() throws IOException {
        // Inicializa o cliente Vertex AI com as credenciais padrão do Google (ADC)
        return new VertexAI(projectId, location);
    }

    @Bean
    public GenerativeModel generativeModel(VertexAI vertexAI) {
        // Cria o modelo generativo usando a instância do VertexAI
        return new GenerativeModel(modelName, vertexAI);
    }
}