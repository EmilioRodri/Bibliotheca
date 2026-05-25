package com.leitura.Biblioteca_api.dto;

import java.util.List;

public class RecomendacaoRequest {

    // As variáveis exatas que o seu React vai mandar no JSON
    private String mood;
    private List<Object> perfil;

    // Construtor vazio (obrigatório para o Spring Boot conseguir ler o JSON)
    public RecomendacaoRequest() {
    }

    // Getters e Setters
    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }

    public List<Object> getPerfil() {
        return perfil;
    }

    public void setPerfil(List<Object> perfil) {
        this.perfil = perfil;
    }
}