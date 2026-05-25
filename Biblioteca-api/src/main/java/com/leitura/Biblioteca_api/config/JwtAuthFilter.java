package com.leitura.Biblioteca_api.config;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            final String authHeader = request.getHeader("Authorization");

            // 1. Verifica se a requisição possui o Token do React
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            String jwt = authHeader.substring(7);

            // 2. A MÁGICA ACONTECE AQUI: O Firebase valida o token sem precisar de banco de dados
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(jwt);
            String userEmail = decodedToken.getEmail();

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 3. Cria um "Usuário Virtual" apenas para o Spring Security liberar a requisição atual
                UserDetails userDetails = new SimpleUser(userEmail, "ROLE_USER");

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            System.out.println(">>> Acesso Negado (Token Inválido ou Expirado): " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    // --- CLASSE INTERNA SEGURA (Sem JPA, Sem Banco de Dados) ---
    public static class SimpleUser implements UserDetails {
        private final String email;
        private final String role;

        public SimpleUser(String email, String role) {
            this.email = email;
            this.role = role;
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return Collections.singletonList(new SimpleGrantedAuthority(role));
        }

        @Override
        public String getPassword() { return ""; } // Senha vazia, pois o Firebase já autenticou
        @Override
        public String getUsername() { return email; }
        @Override
        public boolean isAccountNonExpired() { return true; }
        @Override
        public boolean isAccountNonLocked() { return true; }
        @Override
        public boolean isCredentialsNonExpired() { return true; }
        @Override
        public boolean isEnabled() { return true; }
    }
}