package com.leitura.Biblioteca_api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que modela uma sugestão de livro individual gerada pela IA (Gemini).
 * Este objeto é aninhado dentro de RecomendacaoResponse.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recomendacao {
    private String titulo;
    private String autor;
    private String urlCapa;
    private String motivoRecomendacao;
    private int classificacao; // Nota sugerida pela IA
    private int totalPaginas;  
}