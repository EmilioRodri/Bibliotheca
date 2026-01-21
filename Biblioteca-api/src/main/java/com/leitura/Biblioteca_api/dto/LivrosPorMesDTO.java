package com.leitura.Biblioteca_api.dto;

public class LivrosPorMesDTO {
    private String mes;
    private Long quantidade;

    public LivrosPorMesDTO() {}

    public LivrosPorMesDTO(String mes, Long quantidade) {
        this.mes = mes;
        this.quantidade = quantidade;
    }

    public String getMes() { return mes; }
    public Long getQuantidade() { return quantidade; }
}