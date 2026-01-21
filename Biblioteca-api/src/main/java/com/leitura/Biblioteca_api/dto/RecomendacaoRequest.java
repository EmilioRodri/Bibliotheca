package com.leitura.Biblioteca_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;


@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecomendacaoRequest {
    private List<LivroPerfil> perfil;
    private String mood;
}