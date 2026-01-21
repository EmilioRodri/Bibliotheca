package com.leitura.Biblioteca_api.model;

import jakarta.persistence.*;
import lombok.Data; // <-- A MÁGICA ACONTECE AQUI
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Data // <-- Adicione esta anotação!
@NoArgsConstructor
@AllArgsConstructor
public class ProgressoLeitura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @OneToOne
    @JoinColumn(name = "livro_historico_id", nullable = false, unique = true)
    private LivroHistorico livroHistorico;

    private int paginasLidasAteAgora;
    private int totalPaginas;
    private int prazoDias; // Prazo em dias para terminar
    private LocalDate dataInicioPlano;
}
