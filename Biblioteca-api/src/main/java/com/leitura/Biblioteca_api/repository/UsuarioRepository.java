package com.leitura.Biblioteca_api.repository;

import com.leitura.Biblioteca_api.model.Usuario; // Onde sua classe Usuario está
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository // ESSA ANOTAÇÃO É CRUCIAL!
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Você pode adicionar métodos personalizados aqui, como findByEmail
    // O Spring Data JPA entende que deve retornar um Optional se o usuário pode não existir.
    Optional<Usuario> findByEmail(String email);
}