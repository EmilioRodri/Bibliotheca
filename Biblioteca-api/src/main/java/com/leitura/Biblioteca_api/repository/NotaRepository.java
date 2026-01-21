package com.leitura.Biblioteca_api.repository;

import com.leitura.Biblioteca_api.model.Nota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotaRepository extends JpaRepository<Nota, Long> {
}
