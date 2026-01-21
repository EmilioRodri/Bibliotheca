package com.leitura.Biblioteca_api.config;

import com.leitura.Biblioteca_api.model.Role;
import com.leitura.Biblioteca_api.model.Usuario;
import com.leitura.Biblioteca_api.repository.UsuarioRepository;
import com.leitura.Biblioteca_api.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            final String authHeader = request.getHeader("Authorization");
            final String jwt;
            final String userEmail;

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            jwt = authHeader.substring(7);
            userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // 1. Busca ou Cria a Entidade no Banco
                Usuario entity = buscarOuCriarUsuario(userEmail);

                // 2. CONVERTE PARA UM OBJETO SEGURO (DTO)
                // Isso corta qualquer laço com o Hibernate/Banco de Dados
                UserDetails userDetails = new SimpleUser(
                    entity.getId(), 
                    entity.getEmail(), 
                    entity.getSenha(), 
                    entity.getRole().name()
                );

                // 3. Autentica com o objeto seguro
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            System.out.println(">>> Erro de Segurança (Ignorado): " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private Usuario buscarOuCriarUsuario(String email) {
        Optional<Usuario> userOpt = usuarioRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            return userOpt.get();
        } else {
            System.out.println(">>> AUTO-CADASTRO: " + email);
            Usuario newUser = new Usuario();
            newUser.setEmail(email);
            String nome = email.contains("@") ? email.split("@")[0] : "Leitor";
            newUser.setNome(nome);
            newUser.setSenha("FIREBASE_AUTH");
            newUser.setRole(Role.USER);
            return usuarioRepository.save(newUser);
        }
    }

    // --- CLASSE INTERNA SEGURA (Sem JPA, Sem Lazy Load) ---
    public static class SimpleUser implements UserDetails {
        private final Long id; // Guardamos o ID para usar nos Services
        private final String email;
        private final String password;
        private final String role;

        public SimpleUser(Long id, String email, String password, String role) {
            this.id = id;
            this.email = email;
            this.password = password;
            this.role = role;
        }

        public Long getId() { return id; } // Getter extra para o ID

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return Collections.singletonList(new SimpleGrantedAuthority(role));
        }

        @Override
        public String getPassword() { return password; }
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