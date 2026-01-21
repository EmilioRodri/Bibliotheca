package com.leitura.Biblioteca_api.dto;

public class StatsResponse {
    private Integer ano;
    private long totalLivros;
    private long totalPaginas;
    private double mediaClassificacao;
    private String generoMaisLido;

    public StatsResponse() {}

    public StatsResponse(Integer ano, long totalLivros, long totalPaginas, double mediaClassificacao, String generoMaisLido) {
        this.ano = ano;
        this.totalLivros = totalLivros;
        this.totalPaginas = totalPaginas;
        this.mediaClassificacao = mediaClassificacao;
        this.generoMaisLido = generoMaisLido;
    }

    // Getters são OBRIGATÓRIOS para o JSON funcionar
    public Integer getAno() { return ano; }
    public long getTotalLivros() { return totalLivros; }
    public long getTotalPaginas() { return totalPaginas; }
    public double getMediaClassificacao() { return mediaClassificacao; }
    public String getGeneroMaisLido() { return generoMaisLido; }
}