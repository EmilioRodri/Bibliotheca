package com.leitura.Biblioteca_api.repository;

import com.leitura.Biblioteca_api.model.LivroDesejado;
import com.leitura.Biblioteca_api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LivroDesejadoRepository extends JpaRepository<LivroDesejado, Long> {
    // Métodos de segurança
    List<LivroDesejado> findByUsuario(Usuario usuario);
    Optional<LivroDesejado> findByIdAndUsuario(Long id, Usuario usuario);
}