package com.leitura.Biblioteca_api.config;

// Remova os imports de ProgressoLeitura e Repository
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
// Remova o import de LocalDate

@Component
public class AppDataLoader implements CommandLineRunner {

    // Apague o construtor e a variável do repositório
    
    @Override
    public void run(String... args) throws Exception {
        // Deixe este método VAZIO
        // Não vamos mais pré-carregar "Duna".
    }
}