package com.leitura.Biblioteca_api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
public class LivroHistorico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String uid;

    private String titulo;
    private String autor;
    private String genero;
    private Integer totalPaginas;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private Integer classificacao;
    
    @Column(length = 1000)
    private String urlCapa;
    
    @Column(columnDefinition = "TEXT")
    private String opiniao;
    
    private String status;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnore // CRÍTICO: Impede o loop infinito (Livro -> Usuário -> Livros...)
    private Usuario usuario;

    @OneToMany(mappedBy = "livroHistorico", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // Opcional: evita carregar notas desnecessariamente nas estatísticas
    private List<Nota> notas = new ArrayList<>();

    public LivroHistorico() {}

    // Getters e Setters (Padrão)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }
    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }
    public Integer getTotalPaginas() { return totalPaginas; }
    public void setTotalPaginas(Integer totalPaginas) { this.totalPaginas = totalPaginas; }
    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }
    public Integer getClassificacao() { return classificacao; }
    public void setClassificacao(Integer classificacao) { this.classificacao = classificacao; }
    public String getUrlCapa() { return urlCapa; }
    public void setUrlCapa(String urlCapa) { this.urlCapa = urlCapa; }
    public String getOpiniao() { return opiniao; }
    public void setOpiniao(String opiniao) { this.opiniao = opiniao; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public List<Nota> getNotas() { return notas; }
    public void setNotas(List<Nota> notas) { this.notas = notas; }
}