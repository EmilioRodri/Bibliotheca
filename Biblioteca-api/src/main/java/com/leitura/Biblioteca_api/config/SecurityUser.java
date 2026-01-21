package com.leitura.Biblioteca_api.config;

import com.leitura.Biblioteca_api.model.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

/**
 * Implementação segura de UserDetails que NÃO é uma entidade JPA.
 * Isso previne erros de LazyInitialization e Loops Infinitos de JSON.
 */
public class SecurityUser implements UserDetails {

    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    // Construtor que copia os dados da Entidade para a memória segura
    public SecurityUser(Usuario usuario) {
        this.email = usuario.getEmail();
        this.password = usuario.getSenha(); // ou "FIREBASE"
        
        String roleName = (usuario.getRole() != null) ? usuario.getRole().name() : "USER";
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(roleName));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}