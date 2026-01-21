package com.leitura.Biblioteca_api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de resposta usado para transportar dados de progresso de leitura
 * de um livro específico, calculando métricas como páginas restantes
 * e meta diária.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanilhaResponse {
    private String titulo;
    private int totalPaginas;
    private int paginasLidas;
    private int paginasRestantes;
    private long diasRestantes;
    private int metaPaginasDiaria;
}