package com.leitura.Biblioteca_api.repository;

import com.leitura.Biblioteca_api.model.LivroHistorico;
import com.leitura.Biblioteca_api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LivroHistoricoRepository extends JpaRepository<LivroHistorico, Long> {

    // Query explícita para evitar erros de interpretação do Spring Data
    @Query("SELECT l FROM LivroHistorico l WHERE l.usuario.id = :userId")
    List<LivroHistorico> findByUsuarioId(@Param("userId") Long userId);
    
    List<LivroHistorico> findByUid(String uid);

    List<LivroHistorico> findAllByUsuario(Usuario usuario);

    Optional<LivroHistorico> findByIdAndUsuario(Long id, Usuario usuario);
}