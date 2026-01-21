package com.leitura.Biblioteca_api.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de Resposta Principal.
 * Transporta os resultados da análise da IA (Gemini) de volta para o frontend.
 */
@Data // Inclui @Getter, @Setter, @ToString, @EqualsAndHashCode
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecomendacaoResponse {

    private String motivoGeral; // A explicação do Oráculo (sumário da análise da IA)
    private List<Recomendacao> recomendacoes; // A lista de sugestões individuais
}