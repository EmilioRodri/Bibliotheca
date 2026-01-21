package com.leitura.Biblioteca_api.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LivroPerfil {
    private String titulo;
    private String autor;
    private Integer classificacao;
    private String status;
}