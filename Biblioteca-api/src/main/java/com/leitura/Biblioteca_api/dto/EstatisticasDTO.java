package com.leitura.Biblioteca_api.dto;

import java.util.Map;

public class EstatisticasDTO {
    private int ano;
    private long totalLivros;
    private long totalPaginas;
    private double mediaClassificacao;
    private String generoMaisLido;
    private Map<Integer, Long> livrosPorMes;

    public EstatisticasDTO() {}

    public EstatisticasDTO(int ano, long totalLivros, long totalPaginas, double mediaClassificacao, String generoMaisLido, Map<Integer, Long> livrosPorMes) {
        this.ano = ano;
        this.totalLivros = totalLivros;
        this.totalPaginas = totalPaginas;
        this.mediaClassificacao = mediaClassificacao;
        this.generoMaisLido = generoMaisLido;
        this.livrosPorMes = livrosPorMes;
    }

    public int getAno() { return ano; }
    public long getTotalLivros() { return totalLivros; }
    public long getTotalPaginas() { return totalPaginas; }
    public double getMediaClassificacao() { return mediaClassificacao; }
    public String getGeneroMaisLido() { return generoMaisLido; }
    public Map<Integer, Long> getLivrosPorMes() { return livrosPorMes; }
}