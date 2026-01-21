package com.leitura.Biblioteca_api.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    /**
     * Valida o token diretamente com o Google Firebase.
     */
    public String extractUsername(String token) {
        try {
            // Esta linha manda o token para o Google verificar
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
            // Se o Google disser que é válido, retornamos o email
            return decodedToken.getEmail();
        } catch (Exception e) {
            // Se o token for falso, expirado ou formato errado, retorna null
            System.out.println("Erro na validação do Token Firebase: " + e.getMessage());
            return null;
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return (username != null && username.equals(userDetails.getUsername()));
    }

    // Método mantido apenas para compatibilidade com código legado, se houver.
    // Na prática, o token vem do Frontend (Google), não geramos aqui.
    public String generateToken(UserDetails userDetails) {
        return "TOKEN_GERENCIADO_PELO_FRONTEND";
    }
}