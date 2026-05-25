package com.leitura.Biblioteca_api.dto;


public record RoteiroRequest(
    String titulo,
    String autor,
    String genero,
    String opiniaoPessoal, // Suas notas de leitura
    String mood // Ex: "Sombrio", "Filosófico", "Analítico"
) {}