package com.leitura.Biblioteca_api.config; // Pode mudar para 'Config' se a sua pasta for maiúscula

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Bean
    public FirebaseApp initializeFirebase() {
        try {
            // Lê o arquivo JSON que colocamos na pasta resources
            InputStream serviceAccount = new ClassPathResource("firebase-service-account.json").getInputStream();

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            // Evita erro de "FirebaseApp já existe" se o Spring Boot recarregar
            if (FirebaseApp.getApps().isEmpty()) {
                return FirebaseApp.initializeApp(options);
            } else {
                return FirebaseApp.getInstance();
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao inicializar o Firebase. Verifique o arquivo JSON: " + e.getMessage());
        }
    }
}