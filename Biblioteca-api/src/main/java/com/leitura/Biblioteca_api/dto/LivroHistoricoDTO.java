package com.leitura.Biblioteca_api.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * DTO para transferir dados de um Livro do Histórico,
 * usado principalmente para atualizações (PUT).
 */
@Data
public class LivroHistoricoDTO {
    private String titulo;
    private String autor;
    private String genero;
    private Integer totalPaginas;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private Integer classificacao;
    private String status;
    private String urlCapa;
    private String opiniao;
}