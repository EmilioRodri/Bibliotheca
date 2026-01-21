package com.leitura.Biblioteca_api.config;

import com.leitura.Biblioteca_api.model.Usuario;
import com.leitura.Biblioteca_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario();
            
            // Estes métodos dependem de @Data/@Setter em Usuario.java
            admin.setEmail("admin@biblioteca.com"); 
            admin.setSenha(passwordEncoder.encode("senha123")); 
            
            usuarioRepository.save(admin);
        }
    }
}