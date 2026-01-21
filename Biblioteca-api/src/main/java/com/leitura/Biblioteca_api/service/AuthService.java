package com.leitura.Biblioteca_api.service;

import com.leitura.Biblioteca_api.dto.AuthRequest;
import com.leitura.Biblioteca_api.dto.AuthResponse;
import com.leitura.Biblioteca_api.dto.SignUpRequest;
import com.leitura.Biblioteca_api.model.Role;
import com.leitura.Biblioteca_api.model.Usuario;
import com.leitura.Biblioteca_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Registra um novo usuário no sistema.
     */
    public AuthResponse signup(SignUpRequest request) {
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email já está em uso.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setRole(Role.USER); // Define o papel padrão

        usuarioRepository.save(usuario);

        String jwtToken = jwtService.generateToken(usuario);
        return new AuthResponse(jwtToken);
    }

    /**
     * Autentica um usuário existente e retorna um token JWT.
     */
    public AuthResponse signin(AuthRequest request) {
        // O AuthenticationManager verifica se o email e a senha estão corretos.
        // Se não estiverem, ele lança uma exceção.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getSenha()
                )
        );

        // Se a autenticação for bem-sucedida, busca o usuário para gerar o token.
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        String jwtToken = jwtService.generateToken(usuario);
        return new AuthResponse(jwtToken);
    }
}