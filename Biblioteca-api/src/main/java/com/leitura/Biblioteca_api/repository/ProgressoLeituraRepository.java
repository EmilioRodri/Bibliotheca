package com.leitura.Biblioteca_api.repository;

import com.leitura.Biblioteca_api.model.ProgressoLeitura;
import com.leitura.Biblioteca_api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressoLeituraRepository extends JpaRepository<ProgressoLeitura, Long> {
    
    // 1. Requerido pelo ProgressoService::buscarTodos
    List<ProgressoLeitura> findAllByUsuario(Usuario usuario);
    
    // 2. Requerido pelo ProgressoService::atualizarPaginasLidas e gerarPlanilha
    Optional<ProgressoLeitura> findByLivroHistorico_IdAndUsuario(Long livroId, Usuario usuario);

    // 3. Requerido para verificação de existência do progresso
    Optional<ProgressoLeitura> findByUsuario(Usuario usuario);

    // 4. Requerido pelo ProgressoService::deletar (para segurança)
    Optional<ProgressoLeitura> findByIdAndUsuario(Long id, Usuario usuario);
}