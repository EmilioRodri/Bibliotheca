package com.leitura.Biblioteca_api.dto; // Ajuste para o seu pacote correto

public record RoteiroYoutubeDTO(
    String titulo,
    String autor,
    String genero,
    String opiniaoPessoal, // Suas anotações/resenha do livro salvos no banco
    String focoAnalise,    // Ex: "Psicologia do protagonista", "Niilismo", "Crítica Social"
    String tomVideo        // Ex: "Sombrio", "Filosófico", "Poético"
) {}